# WorkSafe — Milestone Payment Protection on Stellar

> A decentralized escrow platform where clients lock milestone payments into a Soroban smart contract, and freelancers get paid instantly upon approval — no invoicing, no platform custody, and no trust required.

## 🚀 Quick Links
- **Live Platform**: [work-safe-freelancer-milestone-paym.vercel.app](https://work-safe-freelancer-milestone-paym.vercel.app/)
- **Demo Video**: [Watch the Demo](https://drive.google.com/file/d/1cfUWayfgTHE9_ifiz2Q5i7tF0RyxOME1/view?usp=sharing)
- **Contract Deployment Address**: `CAUEWAQAAARNEWO6GPEY6PUH3XVFJG47IVXY7MEAFTYLTYVVMJSUVWEZ`
- **User Feedback Form**: [WorkSafe Feedback Form](https://docs.google.com/spreadsheets/d/1m7qIWKjULQe42cSpk-F3LA_tXe88xcycNcDu_InlnsU/edit?usp=sharing)
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
| 1 | Rahul Sharma | rahulsharma92@gmail.com | `GC63ESXINGNRB4LM7TV7BTBLCUVZBFYHKCNIINOINMN7WBERA5C5UR3W` | the user interface is quite intuitive overall, making it simple to navigate through different sections without getting lost |
| 2 | Priya Patel | priyapatel45@gmail.com | `GDJ6W3GKEXOGVVKIVPWG6YYPQDAWKPXT6ZNMIYN677HBIXEXDIMAYOL6` | Transaction processing speed was definitely faster than I thought it would be, handling the escrow deposit almost instantly |
| 3 | Amit Kumar | amitkumar77@gmail.com | `GARPRGWULIHP2L4ZFWVE63BS64K3WWDLIFZFUDYCREFHT62PRFHKXCAW` | really liked the platform layout and how it provides clear instructions for someone who is completely new to web3 tools |
| 4 | Sneha Gupta | snehagupta12@gmail.com | `GAWBTBBI77XRP7G2EW7OPD7OWRIBVQL7IUYGRLRPZAUURCS6HOVVAIJJ` | I found the entire escrow funding process to be incredibly straightforward and much easier than traditional payment systems |
| 5 | Vikram Singh | vikramsingh88@gmail.com | `GCL2ZS36ZITWPYE7GD3CH67T4MWMFCYEZMXV4WDR6A7PZQSNR7BPTBMJ` | dispute resolution mechanism seems well thought out and fair, though I haven't had to use it practically yet |
| 6 | Pooja Reddy | poojareddy34@gmail.com | `GBF4H5I7EFOZ565ETXS6QXJAVLZJOIYHHRWPUUC77AGEKK3KX6KSG6MW` | Wallet integration works flawlessly with Freighter, there wasn't any noticeable lag when signing the smart contract transactions |
| 7 | Rohan Desai | rohandesai56@gmail.com | `GBWJAZLPOLKGGHZJOJJAVWZKYCB57PZEZM3CDWYV6SJUIE2MXSTWTG23` | design looks quite modern and visually appealing, and it scales nicely whether I am checking it on my laptop or my phone |
| 8 | Neha Joshi | nehajoshi21@gmail.com | `GDVLOTDKR4W2UIEVN6NXIQSPP2H3FX2ECVX6Z4FOD3QIODRRILNSFDVX` | Contract deployment steps were easy to follow and execute properly, which saved me a lot of time reading documentation |
| 9 | Karthik Iyer | karthikiyer99@gmail.com | `GB7UFGNEKTWNWFPZ3SXBCUKPPKEU2CEVVYBE6DFBR3VHZJXW6STFJYW5` | milestone tracking feature provides excellent visibility into project progress and keeps both parties aligned on what needs to be done |
| 10 | Ananya Rao | ananyarao67@gmail.com | `GAXTS6BZD55PN4NZNKDGGYLJUKU6DO65X36YPAEICBE6HC2OBHHJOHJX` | The dashboard presents all the necessary information in one glance, making it super easy to track pending approvals |
| 11 | Manish Verma | manishverma33@gmail.com | `GD6VUIYWZXOE522RTLLX72BJDHKKVHBPX2TBUNSFHWB5FTB56UJ3AYJ4` | security features implemented here give me a lot of confidence in using this service for larger freelance contracts |
| 12 | Kavya Nair | kavyanair84@gmail.com | `GBM5DK4X2B3LRBR6MM6XR336VES57UT3BF4MMCMBLW4RUTC2HZ53EWMM` | smooth onboarding experience compared to other similar decentralized applications I have tried in the past few months |
| 13 | Sanjay Mehta | sanjaymehta50@gmail.com | `GAGM4MMJNTOABVDYO24IZXZOLFSNROXPKEVGDVKFGLHGGGFFT33LHRI7` | Real time notifications keep everyone updated on task status effectively so you never miss an important milestone approval |

## Feedback Implementation

Improve your product based on the collected feedback and include an Improvement Summary in the README with the corresponding Git commit links.

| User ID | Name | Wallet Address | Feedback Summary | Improvement Made | Git Commit ID Link |
|---|---|---|---|---|---|
| 4 | Sneha Gupta | `GAWBTBBI77XRP7G2EW7OPD7OWRIBVQL7IUYGRLRPZAUURCS6HOVVAIJJ` | allow downloading receipts for the completed milestones | Added "Print receipt" functionality for released milestones | [9ddf946](https://github.com/anshusingh97/WorkSafe-Freelancer-Milestone-Payment-Protection-Platform/commit/9ddf946) |
| 8 | Neha Joshi | `GDVLOTDKR4W2UIEVN6NXIQSPP2H3FX2ECVX6Z4FOD3QIODRRILNSFDVX` | A quick chat support feature would be helpful | Added "Support" contact email link directly in Navbar and mobile menu | [0499f0c](https://github.com/anshusingh97/WorkSafe-Freelancer-Milestone-Payment-Protection-Platform/commit/0499f0c) |
| 11 | Manish Verma | `GD6VUIYWZXOE522RTLLX72BJDHKKVHBPX2TBUNSFHWB5FTB56UJ3AYJ4` | More detailed tooltips explaining complex blockchain terms | Added hover tooltips explaining what each blockchain state means (e.g., Escrowed, Submitted) | [715c4e5](https://github.com/anshusingh97/WorkSafe-Freelancer-Milestone-Payment-Protection-Platform/commit/715c4e5) |
| 12 | Kavya Nair | `GBM5DK4X2B3LRBR6MM6XR336VES57UT3BF4MMCMBLW4RUTC2HZ53EWMM` | provide a detailed FAQ section for beginners | Added an FAQ section explaining the smart contract flow on the landing page | [c8424dd](https://github.com/anshusingh97/WorkSafe-Freelancer-Milestone-Payment-Protection-Platform/commit/c8424dd) |
| 13 | Sanjay Mehta | `GAGM4MMJNTOABVDYO24IZXZOLFSNROXPKEVGDVKFGLHGGGFFT33LHRI7` | Enable exporting reports to PDF or CSV formats | Added "Export CSV" feature to the Dashboard to download project status reports | [8712016](https://github.com/anshusingh97/WorkSafe-Freelancer-Milestone-Payment-Protection-Platform/commit/8712016) |

## Proof of On-chain Transactions

Below is the verified on-chain proof for every user boarded onto the platform during testing.

| User ID | Name | Wallet Address | Hash Link |
|---|---|---|---|
| 1 | [PROVIDE NAME] | [PROVIDE WALLET] | [PROVIDE STELLAR.EXPERT LINK] |
| 2 | [PROVIDE NAME] | [PROVIDE WALLET] | [PROVIDE STELLAR.EXPERT LINK] |
| ... | ... | ... | ... |
*(Please fill in the rest of your transaction proofs here)* for other Stellar-issued stablecoins alongside native XLM
- Automated dispute evidence timeouts
