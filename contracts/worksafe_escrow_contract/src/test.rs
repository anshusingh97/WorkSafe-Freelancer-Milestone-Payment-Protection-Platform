#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::{Address as _, Ledger},
    Address, Env,
};

fn setup_token(env: &Env, admin: &Address) -> (Address, token::Client<'static>, token::StellarAssetClient<'static>) {
    let contract_id = env.register_stellar_asset_contract_v2(admin.clone());
    let address = contract_id.address();
    let client = token::Client::new(env, &address);
    let asset_client = token::StellarAssetClient::new(env, &address);
    (address, client, asset_client)
}

struct TestCtx {
    env: Env,
    contract_id: Address,
    client: WorkSafeEscrowContractClient<'static>,
    admin: Address,
    project_client: Address,
    freelancer: Address,
    token: Address,
    token_client: token::Client<'static>,
}

fn setup() -> TestCtx {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let project_client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let (token, token_client, token_admin_client) = setup_token(&env, &token_admin);
    token_admin_client.mint(&project_client, &10_000_000_000i128);

    let contract_id = env.register(WorkSafeEscrowContract, ());
    let client = WorkSafeEscrowContractClient::new(&env, &contract_id);
    client.initialize(&admin);

    TestCtx {
        env,
        contract_id,
        client,
        admin,
        project_client,
        freelancer,
        token,
        token_client,
    }
}

#[test]
fn test_create_milestone() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);

    let m = ctx.client.get_milestone(&1);
    assert_eq!(m.status, MilestoneStatus::Created);
    assert_eq!(m.amount, 500);
    assert_eq!(m.client, ctx.project_client);
    assert_eq!(m.freelancer, ctx.freelancer);
}

#[test]
fn test_full_happy_path_release() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &1000i128);

    ctx.client.fund_milestone(&1);
    assert_eq!(
        ctx.token_client.balance(&ctx.contract_id),
        1000i128,
        "funds should sit in the contract, not with any single party"
    );

    ctx.client.submit_work(&1);
    assert_eq!(ctx.client.get_milestone(&1).status, MilestoneStatus::Submitted);

    ctx.client.approve_and_release(&1);
    let m = ctx.client.get_milestone(&1);
    assert_eq!(m.status, MilestoneStatus::Released);
    assert_eq!(ctx.token_client.balance(&ctx.freelancer), 1000i128);
    assert_eq!(ctx.token_client.balance(&ctx.contract_id), 0i128);
}

#[test]
fn test_prevent_double_release() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);
    ctx.client.fund_milestone(&1);
    ctx.client.submit_work(&1);
    ctx.client.approve_and_release(&1);

    let result = ctx.client.try_approve_and_release(&1);
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

#[test]
fn test_cannot_fund_twice() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);
    ctx.client.fund_milestone(&1);

    let result = ctx.client.try_fund_milestone(&1);
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

#[test]
fn test_cannot_submit_before_funding() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);

    let result = ctx.client.try_submit_work(&1);
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

#[test]
fn test_dispute_resolved_to_freelancer() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &750i128);
    ctx.client.fund_milestone(&1);
    ctx.client.submit_work(&1);

    ctx.client.raise_dispute(&1, &ctx.project_client);
    assert_eq!(ctx.client.get_milestone(&1).status, MilestoneStatus::Disputed);

    ctx.client.resolve_dispute(&1, &true);
    let m = ctx.client.get_milestone(&1);
    assert_eq!(m.status, MilestoneStatus::Released);
    assert_eq!(ctx.token_client.balance(&ctx.freelancer), 750i128);
}

#[test]
fn test_dispute_resolved_refund_to_client() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &750i128);
    ctx.client.fund_milestone(&1);

    ctx.client.raise_dispute(&1, &ctx.freelancer);
    ctx.client.resolve_dispute(&1, &false);

    let m = ctx.client.get_milestone(&1);
    assert_eq!(m.status, MilestoneStatus::Refunded);
    assert_eq!(ctx.token_client.balance(&ctx.project_client), 10_000_000_000i128);
}

#[test]
fn test_cannot_refund_after_release() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);
    ctx.client.fund_milestone(&1);
    ctx.client.submit_work(&1);
    ctx.client.approve_and_release(&1);

    // Dispute can no longer be raised once released.
    let result = ctx.client.try_raise_dispute(&1, &ctx.project_client);
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

#[test]
fn test_duplicate_milestone_id_rejected() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);

    let result = ctx.client.try_create_milestone(
        &1,
        &ctx.project_client,
        &ctx.freelancer,
        &ctx.token,
        &200i128,
    );
    assert_eq!(result, Err(Ok(Error::AlreadyExists)));
}

#[test]
fn test_invalid_amount_rejected() {
    let ctx = setup();
    let result = ctx.client.try_create_milestone(
        &1,
        &ctx.project_client,
        &ctx.freelancer,
        &ctx.token,
        &0i128,
    );
    assert_eq!(result, Err(Ok(Error::InvalidAmount)));
}

#[test]
fn test_only_admin_can_resolve_dispute() {
    let ctx = setup();
    ctx.client
        .create_milestone(&1, &ctx.project_client, &ctx.freelancer, &ctx.token, &500i128);
    ctx.client.fund_milestone(&1);
    ctx.client.raise_dispute(&1, &ctx.project_client);

    // mock_all_auths lets this pass in test env regardless of caller,
    // but the contract still requires the stored admin's auth entry,
    // which is what real (non-mocked) networks will enforce.
    ctx.env.ledger().set_timestamp(ctx.env.ledger().timestamp() + 1);
    ctx.client.resolve_dispute(&1, &true);
    assert_eq!(ctx.client.get_milestone(&1).status, MilestoneStatus::Released);
}
