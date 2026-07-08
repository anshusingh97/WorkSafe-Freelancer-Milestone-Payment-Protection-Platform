# WorkSafe

**Decentralized milestone escrow for freelance work, built on Stellar.**

Clients lock payment into a Soroban smart contract before work begins.
Freelancers get paid the moment a milestone is approved — no invoicing,
no platform holding funds, no trust required beyond the contract itself.

---

## Problem statement

Freelancers risk finishing work without being paid; clients risk paying
upfront for work that never arrives. Centralized platforms solve this with
escrow, but take a cut, add delay, and hold custody of the money the whole
time. WorkSafe moves that escrow on-chain: funds sit in a contract address
that only releases under rules both sides agreed to up front.

## Why Stellar

- Sub-second finality and fractions-of-a-cent fees make milestone-sized
  payments (tens to hundreds of XLM) practical — a traditional escrow
  provider's fixed fees would eat a meaningful share of a small milestone.
- Soroban gives us programmable escrow logic (state machine, dispute
  resolution) without needing a custom L1.
- Freighter gives users a non-custodial wallet they already control.

## Features

- Client / freelancer signup and role-based dashboards
- Freighter wallet connect, enforced before any escrow action
- Project creation, browsing, and acceptance
- Milestone creation, funding, submission, approval, and release
- On-chain dispute flow: either party can raise one, only the contract
  admin can resolve it
- Admin dashboard with platform-wide stats
- PostHog analytics + Sentry error tracking (frontend and backend)
- In-app feedback collection

## Tech stack

| Layer        | Choice                                             |
|--------------|-----------------------------------------------------|
| Frontend     | React + Vite + TypeScript + Tailwind CSS            |
| Backend      | Node.js + Express + TypeScript                      |
| Database     | MongoDB Atlas                                        |
| Wallet       | Freighter                                            |
| Blockchain   | Stellar Testnet + Soroban                            |
| Analytics    | PostHog                                              |
| Monitoring   | Sentry                                               |
| Deployment   | Vercel (frontend) + Render (backend)                 |

## Architecture

```
worksafe/
 ├── frontend/     React app — UI, wallet connect, API calls
 ├── backend/      Express API — auth, off-chain state, indexes on-chain events
 └── contracts/    Soroban contract — the actual escrow, in Rust
```

The backend is **not** the source of truth for money — the contract is.
MongoDB stores the human-facing side of things (project descriptions,
messages, dispute reasons, feedback) and *mirrors* on-chain milestone
status so the UI can query quickly, but every state transition that moves
funds happens through a signed transaction against the Soroban contract.

## Data flow

```
Client creates project (off-chain)
        │
        ▼
Client adds milestone (off-chain record + on-chain create_milestone)
        │
        ▼
Freelancer accepts project (off-chain)
        │
        ▼
Client funds milestone
   → Freighter signs fund_milestone()
   → funds move client → contract address
   → backend stores the resulting tx hash
        │
        ▼
Freelancer submits work (off-chain proof link + on-chain submit_work())
        │
        ▼
Client approves
   → Freighter signs approve_and_release()
   → funds move contract → freelancer
   → backend stores the release tx hash
        │
        ▼
(if disputed instead) → admin resolves on-chain → funds released or refunded
```

## Smart contract

See [`contracts/worksafe_escrow_contract/src/lib.rs`](contracts/worksafe_escrow_contract/src/lib.rs).

Functions: `initialize`, `create_milestone`, `fund_milestone`, `submit_work`,
`approve_and_release`, `raise_dispute`, `resolve_dispute`, `get_milestone`.

Milestone states: `Created → Funded → Submitted → Approved → Released`,
with a `Disputed` branch that resolves to either `Released` or `Refunded`.

Enforced on-chain:
- Only the client can fund and approve
- Only the freelancer can submit work
- A milestone cannot be released twice
- A milestone cannot be refunded after release
- Only the contract admin can resolve a dispute

Tests: `contracts/worksafe_escrow_contract/src/test.rs` — happy path,
double-release prevention, double-fund prevention, dispute resolution
(both directions), duplicate milestone ID rejection, invalid amount
rejection, and admin-gated dispute resolution.

## API routes

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

PATCH  /api/users/wallet

POST   /api/projects
GET    /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id/accept

POST   /api/milestones
GET    /api/milestones/project/:projectId
PATCH  /api/milestones/:id/fund
PATCH  /api/milestones/:id/submit
PATCH  /api/milestones/:id/approve
PATCH  /api/milestones/:id/dispute

POST   /api/disputes
GET    /api/disputes
PATCH  /api/disputes/:id/resolve

POST   /api/feedback
GET    /api/admin/stats
```

## Environment variables

**backend/.env** (see `backend/.env.example`):
```
PORT, NODE_ENV, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN,
FRONTEND_URL, STELLAR_NETWORK, STELLAR_HORIZON_URL,
STELLAR_SOROBAN_RPC_URL, ESCROW_CONTRACT_ID, SENTRY_DSN
```

**frontend/.env** (see `frontend/.env.example`):
```
VITE_API_URL, VITE_POSTHOG_KEY, VITE_POSTHOG_HOST, VITE_SENTRY_DSN
```

## Local setup

```bash
# Backend
cd backend
cp .env.example .env   # fill in MONGODB_URI and JWT_SECRET at minimum
npm install
npm run dev             # http://localhost:5000

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

## Contract deployment

Requires the [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
and the `wasm32-unknown-unknown` Rust target.

```bash
cd contracts
stellar keys generate worksafe-admin --network testnet --fund
./deploy.sh worksafe-admin
# copy the printed contract ID into backend/.env as ESCROW_CONTRACT_ID
```

Run the contract's own test suite:

```bash
cd contracts/worksafe_escrow_contract
cargo test
```

## Deployment

- Frontend → Vercel (`frontend/` as root, `npm run build`, output `dist/`)
- Backend → Render (`backend/` as root, `npm run build && npm start`)
- Database → MongoDB Atlas
- Contract → Stellar Testnet (see above)

## Contract address

_Fill in after deployment:_ `ESCROW_CONTRACT_ID = <paste here>`

## User testing & feedback

See `/feedback` in the app — collects a 1–5 rating, what people liked,
what problem they hit, and whether they'd use it for real work. Admin
stats (`/admin`) aggregate this alongside wallet-connection counts as
proof of real user interaction.

## Future roadmap

- Multi-milestone batch funding in a single transaction
- Reputation scores derived from on-chain release history
- Support for other Stellar-issued stablecoins alongside native XLM
- Automated dispute evidence timeouts
