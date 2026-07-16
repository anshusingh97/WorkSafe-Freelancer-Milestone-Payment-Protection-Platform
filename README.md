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
  ![Dashboard Screenshot](./images/product_ui.png)
  
### Mobile Responsive Design
- **Mobile View**: Fully responsive across all devices.
  ![Mobile Design](./images/mobile_responsive.png)

### Analytics Dashboard
- **Live Telemetry & Verification**:
  ![Analytics Dashboard](./images/analytics_and_monitoring.png)

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
| 1 | Rahul Sharma | GC63ESXINGNRB4LM7TV7BTBLCUVZBFYHKCNIINOINMN7WBERA5C5UR3W | [a3d99b70b3994db1ce1459045711309539a206366a5277c0a606b6ef03f8cb28](https://stellar.expert/explorer/testnet/tx/a3d99b70b3994db1ce1459045711309539a206366a5277c0a606b6ef03f8cb28) |
| 2 | Priya Patel | GDJ6W3GKEXOGVVKIVPWG6YYPQDAWKPXT6ZNMIYN677HBIXEXDIMAYOL6 | [b4cad6ec1732c97b323d5fc786b78e840dcb9d9106a9e689c4cdc096f1d13e45](https://stellar.expert/explorer/testnet/tx/b4cad6ec1732c97b323d5fc786b78e840dcb9d9106a9e689c4cdc096f1d13e45) |
| 3 | Amit Kumar | `GCIHZ3OLFIWYQLSBMNAE6KAPNIO7Q77OI22RII2PSJDDKO6EGGEUDUFF` | [e931843...](https://stellar.expert/explorer/testnet/tx/e931843520a907b3de51aef4a44e66bfd997916415425a0eb61ac9cc9d6c2529) |
| 4 | Sneha Gupta | `GDYYKOHINH2MDS4KXCQW4ZMNSCSCUSFZZUY74RESWY2GZH22NZJDIXX7` | [721327d...](https://stellar.expert/explorer/testnet/tx/721327d8b3a540b0b9ed5e7a3bf53fd9ed76c7833bb4fafb7535143ec9ae88aa) |
| 5 | Vikram Singh | `GBKLEGEJHFMFZX77M3U2WH6GPMWRC6HM2TBNSN3OBIQ3ZBZ6PNGCSKYG` | [69d92d2...](https://stellar.expert/explorer/testnet/tx/69d92d2f7fbd0ee7e038b333accd53e54eaae3b66f02d977e2ba83def8234ed7) |
| 6 | Pooja Reddy | `GB7SIFSXY4OL3Z4HMZSNYGOXSVTN7GL5VHSP3VEV2DYEOIYEHWHCA6C5` | [ac479e9...](https://stellar.expert/explorer/testnet/tx/ac479e904d4aede9e4a746fd529c98f18eb8b96e3500b4db39a93bd8898d6fee) |
| 7 | Rohan Desai | `GDTSDUTJRIC566HGZ6VCVSMOFRE6NFUSVXZ5HES7NIXLRPUFXK4AITGT` | [4adb740...](https://stellar.expert/explorer/testnet/tx/4adb740943ad290e34fad280e63c244ff0ca39eeced8e879e00f487bd3dd5970) |
| 8 | Neha Joshi | `GDUFYH3EPCR2RH2QKDX5UJADXQYLYNVEFT3PJD7FLUEQKPJEAQ7KR5BQ` | [aabf21e...](https://stellar.expert/explorer/testnet/tx/aabf21e2d6108bb064a7c29f33ffdbcc5fe2e00f9fcbcd8307aca06ff4eae5ac) |
| 9 | Karthik Iyer | `GCCRCQKWZBOOBWZFHZG46OGW5OGIV22WGFP6JOL3FMGYJ4LD3R6LTNLZ` | [8cc7994...](https://stellar.expert/explorer/testnet/tx/8cc799453db74f3f278d1ae98830f702d633c890c59a28365f61a89855461555) |
| 10 | Ananya Rao | `GCB4AOLLP6TUCIONDUV7NY2DCJKF7IA6GAELS5IM7AUAGZBO4U65KRSU` | [d2da18f...](https://stellar.expert/explorer/testnet/tx/d2da18fa8ab932d0dd2a2db4f9a33c79f3966e5aa62fb054a9e003c5323d2b10) |
| 11 | Manish Verma | `GD2SQ6HUCJ662HDKTLYI3WTHVFQFWNFSMZIVF6CMEDIV3TXIL44BGY2F` | [f5d3ffe...](https://stellar.expert/explorer/testnet/tx/f5d3ffe9ee435ba7818e2d9a3d64d3bd22b7118f0afd1d49886b70bf9f114b02) |
| 12 | Kavya Nair | `GBD6MBLJGP5H74HFEJVAA6SFLMNOM5ZDLYKU63E23QE4NZ52A3W3Y6YI` | [363f150...](https://stellar.expert/explorer/testnet/tx/363f150307a4a7bf3281fc9a2f23aaa7193bce9b595a21c022376ba3d3dc3928) |
| 13 | Sanjay Mehta | `GDGZ77J2MWWEP3XOOVT3TXIJFSNXB2ZQ6D57JI26MC26P32ET6LL2RLD` | [b61b1dc...](https://stellar.expert/explorer/testnet/tx/b61b1dc7e162fe586dfa2447802e4507bc6f0bb2acee59e43ef21f9d32c46ee3) |
*(Please fill in the rest of your transaction proofs here)* for other Stellar-issued stablecoins alongside native XLM
- Automated dispute evidence timeouts
