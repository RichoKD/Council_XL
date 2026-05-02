# Council_XL × 0G Inference Architecture
 
## Overview
 
```
┌─────────────────────────────────────────────────────────────────┐
│                        USER / BROWSER                           │
│                                                                 │
│   ┌──────────────┐        ┌──────────────────────────────────┐  │
│   │ WalletConnect│◄──────►│        Council_XL Frontend       │  │
│   │   (Wallet)   │  sign  │   (AI Council Templating UI)     │  │
│   └──────┬───────┘        └────────────────┬─────────────────┘  │
│          │ EIP-1193 provider               │ inference request  │
└──────────┼─────────────────────────────────┼────────────────────┘
           │                                 │
           ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     0G SERVING BROKER SDK                       │
│               (@0glabs/0g-serving-broker + ethers.js)           │
│                                                                 │
│   BrowserProvider(walletConnectProvider)                        │
│         └─► getSigner()                                         │
│               └─► createZGComputeNetworkBroker(signer)          │
│                                                                 │
│   ┌──────────────────────┐   ┌──────────────────────────────┐   │
│   │   Ledger / Payment   │   │    Inference Request Layer   │   │
│   │                      │   │                              │   │
│   │  depositFund()       │   │  getRequestHeaders()         │   │
│   │  transferFund()      │   │  processResponse()           │   │
│   │  getLedger()         │   │  (single-use per request)    │   │
│   └──────────┬───────────┘   └──────────────┬───────────────┘   │
└──────────────┼──────────────────────────────┼───────────────────┘
               │ on-chain tx                  │ signed HTTP headers
               ▼                              ▼
┌──────────────────────────┐   ┌─────────────────────────────────┐
│      0G CHAIN (L1)       │   │      0G COMPUTE NETWORK         │
│   EVM-compatible, EIP-   │   │   (GPU Provider Marketplace)    │
│   1193, Mainnet/Testnet  │   │                                 │
│                          │   │  ┌───────────────────────────┐  │
│  Smart Contracts:        │   │  │   Provider Endpoint       │  │
│  - Payment settlement    │   │  │   (OpenAI-compatible API) │  │
│  - Sub-account ledger    │   │  │                           │  │
│  - Provider registry     │   │  │  POST /chat/completions   │  │
│  - Fee coordination      │   │  │  POST /v1/proxy (secret)  │  │
│                          │   │  └───────────────────────────┘  │
│  RPC Endpoints:          │   │                                 │
│  Mainnet: evmrpc.0g.ai   │   │  Models: LLMs, text-to-image,   │
│  Testnet: evmrpc-        │   │  speech-to-text, fine-tuned     │
│   testnet.0g.ai          │   │                                 │
└──────────────────────────┘   └─────────────────────────────────┘
```
 
---
 
## Component Breakdown
 
### 1. User Layer
 
| Component | Role |
|---|---|
| **WalletConnect** | Provides EIP-1193 wallet provider; user signs payment transactions without exposing private keys |
| **Council_XL Frontend** | Sends prompts through the templating engine; receives and renders council responses |
 
### 2. SDK Layer — `@0glabs/0g-serving-broker`
 
The broker is the glue between the wallet and the 0G network. It handles two concerns:
 
**Payment / Ledger**
- `depositFund(amount)` — moves 0G tokens into the main account
- `transferFund(providerAddress, 'inference', amount)` — locks funds in a provider sub-account (min 1 0G)
- `getLedger()` — checks balances
**Inference**
- `getRequestHeaders(providerAddress, content)` — generates a **single-use** signed auth header per request
- `processResponse(providerAddress, content, chatID)` — verifies the response (optional, for verifiable services)
> ⚠️ In browser environments, auto-funding is disabled. Ledger management must be done explicitly to avoid unexpected wallet popups mid-session.
 
### 3. 0G Chain (L1)
 
- EVM-compatible Layer-1 (Mainnet: Chain ID `16661`, Testnet: `16602`)
- Smart contracts handle **payment settlement, provider registry, and sub-account coordination**
- Does **not** execute inference — it coordinates and settles it
- Compatible with ethers.js, web3.js, Hardhat, Foundry
### 4. 0G Compute Network
 
- Decentralized GPU marketplace
- Exposes an **OpenAI-compatible REST API** (`/chat/completions`)
- Each provider enforces rate limits (default: 30 req/min, 5 concurrent)
- Supports sync and async inference modes
---
 
## Data Flow: Single Inference Request
 
```
1. User connects wallet via WalletConnect
        │
        ▼
2. BrowserProvider wraps WalletConnect provider
   Signer passed to createZGComputeNetworkBroker()
        │
        ▼
3. (One-time) User signs ledger deposit + provider fund transfer
   → on-chain transaction on 0G Chain
        │
        ▼
4. Council_XL template engine assembles prompt
        │
        ▼
5. broker.inference.getRequestHeaders(providerAddress, prompt)
   → generates signed, single-use auth header
        │
        ▼
6. POST https://<provider-endpoint>/chat/completions
   Headers: { ...signedHeaders, "Content-Type": "application/json" }
   Body:    { messages, model }
        │
        ▼
7. GPU provider executes inference, returns response
        │
        ▼
8. (Optional) broker.inference.processResponse() verifies output
        │
        ▼
9. Council_XL renders response in templating UI
```
 
---
 
## Account Model
 
```
Wallet (WalletConnect)
    │
    │ deposit
    ▼
Main Account (0G Chain)
    │
    │ transferFund (per provider)
    ├──────────────────────────────────────────┐
    ▼                                          ▼
Provider Sub-Account A               Provider Sub-Account B
(min 1 0G locked)                    (min 1 0G locked)
    │                                          │
    ▼                                          ▼
GPU Provider A endpoint              GPU Provider B endpoint
```
 
Fees are auto-settled by the broker at scheduled intervals from sub-accounts.
 
---
 
## Environment Setup
 
```
Council_XL
├── Frontend (Vite + React)
│   ├── vite.config.ts          ← node polyfills required
│   │   └── vite-plugin-node-polyfills
│   │       (crypto, stream, util, buffer, process)
│   └── WalletConnect integration
│       └── @walletconnect/modal or wagmi
│
└── Inference Layer
    ├── @0glabs/0g-serving-broker
    ├── ethers
    └── openai (optional, for OpenAI-compatible client)
```
 
### Network Config
 
| Network | Chain ID | RPC |
|---|---|---|
| Mainnet (Aristotle) | 16661 | `https://evmrpc.0g.ai` |
| Testnet (Galileo) | 16602 | `https://evmrpc-testnet.0g.ai` |
 
---
 
## Key Constraints
 
| Constraint | Detail |
|---|---|
| **Headers are single-use** | Call `getRequestHeaders()` fresh for every request |
| **Minimum sub-account balance** | 1 0G token per provider |
| **Rate limits** | 30 req/min, 5 concurrent (provider-set, may vary) |
| **Browser polyfills** | Vite requires `vite-plugin-node-polyfills` for crypto/buffer |
| **No auto-funding in browser** | Must call `depositFund` + `transferFund` manually |
| **WalletConnect compatibility** | Any EIP-1193 provider works — pass directly to `BrowserProvider` |
