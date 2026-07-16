# WorkSafe — Milestone Payment Protection on Stellar

> A decentralized escrow platform where clients lock milestone payments into a Soroban smart contract, and freelancers get paid instantly upon approval — no invoicing, no platform custody, and no trust required.

## 🚀 Quick Links
- **Live Platform**: [work-safe-freelancer-milestone-paym.vercel.app](https://work-safe-freelancer-milestone-paym.vercel.app/)
- **Demo Video**: [Watch the Demo](https://drive.google.com/file/d/1cfUWayfgTHE9_ifiz2Q5i7tF0RyxOME1/view?usp=sharing)
- **Contract Deployment Address**: `CAUEWAQAAARNEWO6GPEY6PUH3XVFJG47IVXY7MEAFTYLTYVVMJSUVWEZ`
- **User Feedback Form**: [CertifyChain Feedback Form](https://docs.google.com/spreadsheets/d/1m7qIWKjULQe42cSpk-F3LA_tXe88xcycNcDu_InlnsU/edit?usp=sharing)
- **User Feedback Responses**: [View Responses Sheet Link](https://docs.google.com/spreadsheets/d/1m7qIWKjULQe42cSpk-F3LA_tXe88xcycNcDu_InlnsU/edit?usp=sharing)

---

## Why this exists

Freelancers risk finishing work without being paid; clients risk paying upfront for work that never arrives. Centralized freelance platforms solve this with escrow, but they take a massive cut (often 20%), add withdrawal delays, and hold full custody of the money the whole time.

WorkSafe solves this by moving escrow on-chain natively with Stellar. Funds sit in a smart contract address that only releases under rules both sides agreed to up front. Sub-second finality and fractions-of-a-cent fees make milestone-sized payments practical, and users retain full control through their non-custodial Freighter wallets.

## How it actually works

```text
   Client                                             Freelancer
      │                                                   ▲
      │  fund_milestone()                                 │  approve_and_release()
      ▼                                                   │ 
┌───────────────────────────────────────────────────────────┐
│ WorkSafe Soroban Escrow Contract                          │
│ (Holds XLM Native Token in Escrow)                        │
└───────────────────────────────────────────────────────────┘
```

- **Client → Contract**: The client calls `fund_milestone()` which locks XLM from their Freighter wallet directly into the contract address.
- **Freelancer → Contract**: The freelancer submits their work URL and calls `submit_work()` on the contract to signal completion.
- **Contract → Freelancer**: The client reviews the work and calls `approve_and_release()`. The contract instantly transfers the XLM to the freelancer's wallet.
- Every milestone lifecycle produces real `txHashes` for funding and releasing that are transparent on [stellar.expert](https://stellar.expert/explorer/testnet).

## Architecture

```text
frontend/          React + Vite + TS — responsive dashboards, wallet connect
backend/           Node + Express + TS — off-chain state, auth, indexing
contracts/         Soroban smart contract (Rust) — the actual escrow
```

| Layer | Choice |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas |
| Wallet | Freighter |
| Blockchain | Stellar Testnet |
| Smart Contract | Soroban (Rust) |
| Analytics | PostHog |
| Monitoring | Sentry |

## Product Screenshots

### Product UI
- **Dashboard Overview**:
  ![Dashboard Screenshot](./images/product_UI.png)
  
### Mobile Responsive Design
- **Mobile View**: Fully responsive across all devices.
  ![Mobile Design](./images/mobile_responsive.png)

### Analytics Dashboard
- **Live Telemetry & Verification**:
  ![Analytics Dashboard](./images/monitoring_dashboard.png)

## Users Onboarded

Below is the list of users who actively tested the platform and provided feedback:

| User ID | Name | Email | Wallet Address | Feedback Summary |
|---|---|---|---|---|
| 1 | [PROVIDE NAME] | [PROVIDE EMAIL] | [PROVIDE WALLET] | [PROVIDE FEEDBACK] |
| 2 | [PROVIDE NAME] | [PROVIDE EMAIL] | [PROVIDE WALLET] | [PROVIDE FEEDBACK] |
| ... | ... | ... | ... | ... |
*(Please fill in the rest of your onboarded users here)*

## Feedback Implementation

Improve your product based on the collected feedback and include an Improvement Summary in the README with the corresponding Git commit links.

| User ID | Name | Email | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID |
|---|---|---|---|---|---|---|
| 1 | [PROVIDE NAME] | [PROVIDE EMAIL] | [PROVIDE WALLET] | [PROVIDE FEEDBACK] | [PROVIDE IMPROVEMENT] | [PROVIDE COMMIT ID] |
| ... | ... | ... | ... | ... | ... | ... |
*(Please fill in the rest of the feedback implementation here)*

## Proof of On-chain Transactions

Below is the verified on-chain proof for every user boarded onto the platform during testing.

| User ID | Name | Wallet Address | Hash Link |
|---|---|---|---|
| 1 | [PROVIDE NAME] | [PROVIDE WALLET] | [PROVIDE STELLAR.EXPERT LINK] |
| 2 | [PROVIDE NAME] | [PROVIDE WALLET] | [PROVIDE STELLAR.EXPERT LINK] |
| ... | ... | ... | ... |
*(Please fill in the rest of your transaction proofs here)* for other Stellar-issued stablecoins alongside native XLM
- Automated dispute evidence timeouts
