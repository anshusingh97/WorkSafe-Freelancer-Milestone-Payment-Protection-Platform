#![no_std]

//! WorkSafe Escrow Contract
//!
//! Milestone-based payment protection for freelancers and clients.
//! Funds move through the contract's own address, so "escrow" is enforced
//! by the ledger, not by trusting an admin wallet.
//!
//! State machine per milestone:
//!   Created -> Funded -> Submitted -> Approved -> Released
//!                              \-> Disputed -> Released | Refunded
//!
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env,
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Created = 0,
    Funded = 1,
    Submitted = 2,
    Approved = 3,
    Released = 4,
    Disputed = 5,
    Refunded = 6,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub client: Address,
    pub freelancer: Address,
    pub token: Address, // asset contract used for payment (e.g. native XLM SAC)
    pub amount: i128,
    pub status: MilestoneStatus,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    Milestone(u64), // milestone_id -> Milestone
    Admin,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
pub enum Error {
    NotFound = 1,
    AlreadyExists = 2,
    InvalidStatus = 3,
    Unauthorized = 4,
    InvalidAmount = 5,
    NotInitialized = 6,
}

// ---------------------------------------------------------------------------
// Contract
// ---------------------------------------------------------------------------

#[contract]
pub struct WorkSafeEscrowContract;

#[contractimpl]
impl WorkSafeEscrowContract {
    /// One-time setup. `admin` is the address allowed to resolve disputes.
    pub fn initialize(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    pub fn get_admin(env: Env) -> Result<Address, Error> {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)
    }

    /// Client registers a new milestone. Nothing moves yet — this only
    /// records the agreement (amount, parties, token) on-chain.
    pub fn create_milestone(
        env: Env,
        milestone_id: u64,
        client: Address,
        freelancer: Address,
        token: Address,
        amount: i128,
    ) -> Result<(), Error> {
        client.require_auth();

        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }
        let key = DataKey::Milestone(milestone_id);
        if env.storage().persistent().has(&key) {
            return Err(Error::AlreadyExists);
        }

        let milestone = Milestone {
            client: client.clone(),
            freelancer: freelancer.clone(),
            token,
            amount,
            status: MilestoneStatus::Created,
            created_at: env.ledger().timestamp(),
        };
        env.storage().persistent().set(&key, &milestone);
        env.storage().persistent().extend_ttl(&key, 100_000, 500_000);

        env.events().publish(
            (symbol_short!("Created"), milestone_id),
            (client, freelancer, amount),
        );

        Ok(())
    }

    /// Client deposits funds into the contract's own balance, transferring
    /// `amount` of `token` from the client to this contract address.
    pub fn fund_milestone(env: Env, milestone_id: u64) -> Result<(), Error> {
        let key = DataKey::Milestone(milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        milestone.client.require_auth();

        if milestone.status != MilestoneStatus::Created {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &milestone.token);
        token_client.transfer(
            &milestone.client,
            &env.current_contract_address(),
            &milestone.amount,
        );

        milestone.status = MilestoneStatus::Funded;
        env.storage().persistent().set(&key, &milestone);

        env.events().publish(
            (symbol_short!("Funded"), milestone_id),
            milestone.amount,
        );

        Ok(())
    }

    /// Freelancer marks the milestone's work as submitted for review.
    pub fn submit_work(env: Env, milestone_id: u64) -> Result<(), Error> {
        let key = DataKey::Milestone(milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        milestone.freelancer.require_auth();

        if milestone.status != MilestoneStatus::Funded {
            return Err(Error::InvalidStatus);
        }

        milestone.status = MilestoneStatus::Submitted;
        env.storage().persistent().set(&key, &milestone);

        env.events().publish(
            (symbol_short!("Submit"), milestone_id),
            (),
        );
        Ok(())
    }

    /// Client approves the submitted work; contract immediately releases
    /// the escrowed funds to the freelancer in the same call.
    pub fn approve_and_release(env: Env, milestone_id: u64) -> Result<(), Error> {
        let key = DataKey::Milestone(milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        milestone.client.require_auth();

        if milestone.status != MilestoneStatus::Submitted {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &milestone.token);
        token_client.transfer(
            &env.current_contract_address(),
            &milestone.freelancer,
            &milestone.amount,
        );

        milestone.status = MilestoneStatus::Released;
        env.storage().persistent().set(&key, &milestone);

        env.events().publish(
            (symbol_short!("Released"), milestone_id),
            (milestone.freelancer.clone(), milestone.amount),
        );

        Ok(())
    }

    /// Either party raises a dispute. Allowed any time after funding and
    /// before final release/refund, so a wrongly-submitted or ignored
    /// milestone can still be escalated.
    pub fn raise_dispute(env: Env, milestone_id: u64, raised_by: Address) -> Result<(), Error> {
        raised_by.require_auth();

        let key = DataKey::Milestone(milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        if raised_by != milestone.client && raised_by != milestone.freelancer {
            return Err(Error::Unauthorized);
        }

        match milestone.status {
            MilestoneStatus::Funded | MilestoneStatus::Submitted => {}
            _ => return Err(Error::InvalidStatus),
        }

        milestone.status = MilestoneStatus::Disputed;
        env.storage().persistent().set(&key, &milestone);

        env.events().publish(
            (symbol_short!("Dispute"), milestone_id),
            raised_by,
        );

        Ok(())
    }

    /// Admin-only resolution of a disputed milestone. Moves escrowed funds
    /// either to the freelancer or back to the client.
    pub fn resolve_dispute(
        env: Env,
        milestone_id: u64,
        release_to_freelancer: bool,
    ) -> Result<(), Error> {
        let admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .ok_or(Error::NotInitialized)?;
        admin.require_auth();

        let key = DataKey::Milestone(milestone_id);
        let mut milestone: Milestone = env
            .storage()
            .persistent()
            .get(&key)
            .ok_or(Error::NotFound)?;

        if milestone.status != MilestoneStatus::Disputed {
            return Err(Error::InvalidStatus);
        }

        let token_client = token::Client::new(&env, &milestone.token);
        let recipient = if release_to_freelancer {
            milestone.freelancer.clone()
        } else {
            milestone.client.clone()
        };
        token_client.transfer(&env.current_contract_address(), &recipient, &milestone.amount);

        milestone.status = if release_to_freelancer {
            MilestoneStatus::Released
        } else {
            MilestoneStatus::Refunded
        };
        env.storage().persistent().set(&key, &milestone);

        env.events().publish(
            (symbol_short!("Resolved"), milestone_id),
            release_to_freelancer,
        );

        Ok(())
    }

    /// Read-only accessor for off-chain services (backend indexer, UI).
    pub fn get_milestone(env: Env, milestone_id: u64) -> Result<Milestone, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Milestone(milestone_id))
            .ok_or(Error::NotFound)
    }
}

#[cfg(test)]
mod test;
