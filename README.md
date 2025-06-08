# Magnify World App V2 🌟

## Overview

Magnify World App V2 is a modern DeFi dashboard and lending platform integrating cutting-edge NFT verification with dynamic loan management. Built with React, TypeScript, and Vite, and powered by a Cloudflare Workers backend with Supabase for database operations and QuickNode for World Chain RPC connections. The platform leverages World ID credentials and NFT collateral to offer undercollateralized loans based on three verification tiers: Device, Passport, and ORB.

## Table of Contents

1.  [Overview](#overview)
2.  [Features](#features)
3.  [Technical Stack](#technical-stack)
4.  [Architecture](#architecture)
5.  [Getting Started](#getting-started)
    *   [Prerequisites](#prerequisites)
    *   [Cloning the Repository](#cloning-the-repository)
    *   [Installation](#installation)
6.  [Environment Variables](#environment-variables)
7.  [Running the Project](#running-the-project)
8.  [Building for Production](#building-for-production)
9.  [Linting](#linting)
10. [NFT Verification System](#nft-verification-system)
11. [Loan Management](#loan-management)
12. [Smart Contract Integration](#smart-contract-integration)
13. [Frontend & State Management](#frontend--state-management)
14. [Security Considerations](#security-considerations)
15. [Deployment](#deployment)
16. [Development & Contribution Guidelines](#development--contribution-guidelines)
17. [Future Improvements](#future-improvements)
18. [Troubleshooting](#troubleshooting)
19. [Support](#support)
20. [Acknowledgements](#acknowledgements)
21. [License](#license)

## Features

-   **NFT Verification System:** Three-tier verification using World ID credentials. Minting of tier-specific NFTs that serve as collateral for loans.
-   **Dynamic Loan Management:** Under-collateralized loans based on user verification tier. Extended functionality in V2/V3 contracts, including Permit2 integration for secure token transfers during repayments.
-   **User Management:** Profile dashboard with NFT collateral and loan activity displays. Secure authentication powered by Supabase.
-   **Responsive & Modern UI:** Built with React, Tailwind CSS, and shadcn/ui components. Adaptable design for mobile, tablet, and desktop experiences.
-   **Monitoring & Analytics:** Sentry integration for production error tracking. Eruda debugging for selected developer wallet addresses.

## Technical Stack

-   **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion.
-   **Backend:** Cloudflare Workers (TypeScript), Supabase (Authentication, PostgreSQL, Real-time Subscriptions, Edge Functions).
-   **Blockchain:** World Chain (Chain ID 480) integration via Wagmi & Viem, World ID SDK (`@worldcoin/idkit`, `@worldcoin/minikit-js`, `@worldcoin/minikit-react`). RPC via QuickNode.
-   **Smart Contracts:** Solidity (`pragma solidity ^0.8.25;` or higher recommended). Contracts built on OpenZeppelin libraries (V1, V2, and V3 versions exist).
-   **Package Manager:** pnpm

## Architecture

The application comprises several core subsystems:

-   **Frontend (React/Vite):** User interface, state management, and interaction with backend and blockchain.
-   **Backend (Cloudflare Workers):** Handles API requests, business logic, database operations (via Supabase), World ID proof verification, blockchain interactions (via QuickNode), and authentication services.
-   **Supabase:** Provides database (PostgreSQL), authentication, and real-time subscription services.
-   **World Chain:** The L2 blockchain where smart contracts are deployed and transactions occur.
-   **Smart Contracts (Solidity):** Manage NFT minting, verification tiers, loan issuance, and repayments.

Key interactions:
1.  User interacts with the frontend.
2.  Frontend communicates with the Cloudflare Workers backend for operations requiring private keys or complex logic (e.g., World ID proof verification, Supabase interactions).
3.  Frontend interacts directly with World Chain smart contracts for on-chain actions (e.g., sending transactions via Wagmi).
4.  Backend interacts with Supabase for data storage and retrieval, and with QuickNode for blockchain data and transaction relaying.

```mermaid
graph TD
    A[User] -- Interacts --> FE[Frontend (React/Vite)]
    FE -- API Calls --> BE[Backend (Cloudflare Worker)]
    FE -- Wallet Ops (Wagmi/Viem) --> WC[World Chain (Contracts)]
    BE -- DB/Auth --> SUPA[Supabase]
    BE -- RPC Calls --> QN[QuickNode]
    WC -- Reads/Writes --> QN
    A -- World ID --> WID[World ID Kit/SDK]
    WID -- Verification --> BE
```

## Getting Started

### Prerequisites

-   Node.js (LTS version recommended)
-   pnpm (This project uses pnpm for package management)
    ```bash
    npm install -g pnpm
    ```

### Cloning the Repository

```bash
git clone <repository-url>
cd magnify-cash-worldcoin-app-V2-1
```

### Installation

Install project dependencies using pnpm:

```bash
pnpm install
```

## Environment Variables

This project requires several environment variables to function correctly. Create a `.env` file in the root of the project by copying the example (if one exists) or creating it manually. Populate it with the following values, which can also be found configured for different environments in `netlify.toml`:

```env
# Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Worldcoin Application ID (obtain from Worldcoin Developer Portal)
VITE_WORLDCOIN_CLIENT_ID=app_your_worldcoin_app_id

# Backend API URL (your Cloudflare Worker URL)
VITE_BACKEND_URL=https://your-worker-backend.workers.dev

# Sentry DSN for error tracking (optional)
VITE_SENTRY_DSN=your_sentry_dsn

# Smart Contract Addresses on World Chain (Chain ID 480)
VITE_MAGNIFY_WORLD_ADDRESS_V2=0x...
VITE_MAGNIFY_WORLD_ADDRESS_V3=0x...
VITE_DEFAULTS_ADDRESS=0x...

# Environment identifier (e.g., development, staging, production)
VITE_ENVIRONMENT=development
```

Refer to `netlify.toml` for specific values used in different deployment contexts (production, staging, development).

## Running the Project

To start the development server:

```bash
pnpm dev
```

This will typically start the application on `http://localhost:5173` (or another port if 5173 is busy).

To preview a production build locally:

```bash
pnpm build
pnpm preview
```

## Building for Production

To create a production-ready build of the application:

```bash
pnpm build
```

The build artifacts will be placed in the `dist/` directory.

There is also a script for a development build:
```bash
pnpm build:dev
```

## Linting

To check the codebase for linting errors and formatting issues according to the project's ESLint configuration:

```bash
pnpm lint
```

## NFT Verification System

The NFT Verification System utilizes World ID credentials to mint tier-specific NFTs that serve as collateral:
{{ ... }}

## NFT Verification System

The NFT Verification System utilizes World ID credentials to mint tier-specific NFTs that serve as collateral:

-   **Process Flow:**
    1.  The user initiates authentication via the World ID interface (`@worldcoin/idkit`).
    2.  The frontend sends the ZKP (Zero-Knowledge Proof) to the backend (Cloudflare Worker).
    3.  The backend verifies the proof against the Worldcoin Developer Portal (or on-chain verifier).
    4.  Upon successful verification, the backend may trigger a smart contract function (or instruct the frontend to do so) to mint an NFT corresponding to the user's verification tier (Device, Passport, ORB).
    5.  NFT metadata (stored on-chain or off-chain) determines the user's loan eligibility.
-   **Key Components:**
    -   `UpgradeVerification` UI: Interactive interface for users.
    -   `useMagnifyWorld` Hook: Manages tier IDs, verification levels, NFT data caching, and state.

Example snippet from `useMagnifyWorld` hook (illustrative):
```typescript
// useMagnifyWorld hook snippet
const { data, refetch } = useMagnifyWorld(walletAddress);
const currentTier = data?.nftInfo.tier?.verificationStatus;

{{ ... }}
// useMagnifyWorld hook snippet
const { data, refetch } = useMagnifyWorld(walletAddress);
const currentTier = data?.nftInfo.tier?.verificationStatus;

// Cache invalidation for wallet data
export function invalidateCache(walletAddress: `0x${"string"}`) {
  delete globalCache[walletAddress]; // Example, actual implementation may vary
}
```

## Loan Management

{{ ... }}

## Loan Management

Loan management leverages NFT collateral to provide undercollateralized loans:

-   **Loan Request Process:**
    1.  The user requests a loan using their minted NFT as collateral.
    2.  The system (smart contract) validates NFT ownership and eligibility based on tier parameters.
    3.  The loan is issued from the smart contract if sufficient funds are available in the pool.
-   **Loan Repayment:** Uses Permit2 functionality for secure, EIP-2612 style permissioned token transfers to repay loans, enhancing UX by potentially reducing transaction steps.
-   **Contract Integration:** The V2 and V3 contracts extend V1, incorporating new events (e.g., `LoanRequested`, `LoanRepaid`, `LoanTokensWithdrawn`) and robust query capabilities.

Representative V2/V3 contract snippet (conceptual):
```solidity
// Example: Requesting a loan in MagnifyWorldV2 or V3
function requestLoan() external nonReentrant {
    uint256 tokenId = userNFT[msg.sender]; // Simplified, actual may differ
    require(tokenId != 0, "No NFT owned");
    // ... (owner checks, tier validation, active loan checks for V1/V2/V3) ...

    (uint256 loanAmount, uint256 interestRate, uint256 loanPeriod) = tiers[nftToTier[tokenId]];
    require(loanToken.balanceOf(address(this)) >= loanAmount, "Insufficient contract balance");

    activeLoans[tokenId] = Loan(
        loanAmount,
        block.timestamp,
        true,
        interestRate,
        loanPeriod
{{ ... }}
}
```

## Smart Contract Integration

The project's smart contracts are deployed on World Chain (Chain ID 480).

-   **MagnifyWorld V1:** Core NFT minting, verification, and initial loan functionalities.
-   **MagnifyWorld V2 & V3:** Extend V1 with dynamic loan management, Permit2 integration, and improved query functions. Contract addresses are managed via `VITE_MAGNIFY_WORLD_ADDRESS_V2` and `VITE_MAGNIFY_WORLD_ADDRESS_V3` environment variables.

It is recommended to use `pragma solidity ^0.8.25;` or a higher compatible version. Contracts should adhere to Checks-Effects-Interactions pattern, use custom errors, and emit events for state changes.

Smart contract source files are typically located in a `/contracts` or `/packages/foundry-project/contracts` directory (please verify actual location in the codebase).

## Frontend & State Management

-   **Routing & Protected Pages:** React Router (`react-router-dom`) manages navigation. Protected routes ensure only authenticated users access sensitive areas (e.g., Profile, Wallet, Loan pages).
    ```jsx
    <Route path="/upgrade-verification" element={
      <ProtectedRoute>
        <UpgradeVerification />
      </ProtectedRoute>
    } />
    ```
-   **State & Data Caching:** TanStack Query (`@tanstack/react-query`) for server state management (fetching, caching, synchronizing asynchronous data). Custom React hooks (e.g., `useMagnifyWorld`, `useRepayLoan`) encapsulate blockchain interaction logic and state.
-   **Component Structure:** Components are organized under `src/components/`, often utilizing `shadcn/ui` for pre-built, accessible UI elements, and `Tailwind CSS` for styling.

## Security Considerations

-   **World ID Proof Validation:** Backend (Cloudflare Worker) verifies ZKPs from World ID to ensure authenticity and prevent replay attacks. Short expiration windows for proofs are critical.
-   **Rate Limiting:** Implemented on sensitive backend endpoints and potentially in smart contracts (e.g., cooldown periods for verification attempts).
    ```solidity
    // Smart contract modifier example
    modifier checkCooldown() {
      require(block.timestamp > lastVerificationAttempt[msg.sender] + VERIFICATION_COOLDOWN, "Cooldown active");
      _;
    }
    ```
-   **Data Privacy:** Minimize storage and transmission of sensitive user data. Encrypt where necessary.
-   **Smart Contract Safeguards:** Adherence to security best practices like Checks-Effects-Interactions, reentrancy guards (`nonReentrant`), input validation, and use of well-audited libraries (OpenZeppelin). Regular audits are recommended.
-   **Environment Variable Security:** Never commit `.env` files containing secrets. Use `.gitignore`.
-   **Input Sanitization:** Sanitize all user inputs on the frontend and backend to prevent XSS and other injection attacks.

## Deployment

The application is typically deployed to Netlify (frontend) and Cloudflare Workers (backend).

-   **Frontend (Netlify):** The `netlify.toml` file configures build settings, redirects, and environment variables for different contexts (production, staging, development). Netlify automatically builds and deploys from the connected Git repository.
-   **Backend (Cloudflare Workers):** Deployment of the worker script (e.g., using Wrangler CLI).

Ensure all necessary environment variables (see [Environment Variables](#environment-variables) section) are configured in your deployment platform's settings.

## Development & Contribution Guidelines

Contributions are welcome! Please follow these guidelines:

1.  **Fork the repository** and create your feature branch from `main` or `develop` (confirm branch strategy).
2.  **Follow coding standards:** Use TypeScript, adhere to ESLint (`pnpm lint`) and Prettier (or configured formatter). Refer to the global rules for specific ESLint rules and TypeScript strictness settings.
3.  **Write tests:** Aim for comprehensive test coverage for new features and bug fixes.
4.  **Document your code:** Add JSDoc comments for exported functions and components.
5.  **Submit detailed pull requests:** Clearly describe changes, link to relevant issues, and ensure CI checks pass.

## Future Improvements

-   **Credit History System:** Track repayment data to establish user credit scores for more nuanced loan terms.
-   **Enhanced Liquidity Pools:** Introduce DeFi features like automated market making (AMM) or yield farming.
-   **Governance Mechanisms:** Allow token holders to vote on platform parameters.
-   **Expanded Collateral Types:** Support for other forms of collateral beyond World ID NFTs.

## Troubleshooting

### RPC and Network Issues

#### Withdrawal Transaction Failures
If you experience withdrawal transaction failures with "Internal JSON-RPC error":

1. **Check RPC Consistency**: Ensure all components use the same RPC provider
2. **Clear Browser Cache**: Sometimes cached RPC responses can cause issues  
3. **Switch Networks**: Disconnect and reconnect to World Chain in your wallet
4. **Try Again**: RPC issues are often temporary

#### RPC Configuration
The application uses QuickNode for World Chain RPC connections:
- **Primary RPC**: `https://yolo-intensive-owl.worldchain-mainnet.quiknode.pro/02bc3fb4f359e0c2dadc693ec8c9de8288edfad8/`
- **Chain ID**: 480 (World Chain)
- **All transaction confirmations and state queries use this endpoint**

#### Recent Changes (December 2024)
- **Migration**: Moved from Alchemy public RPC to QuickNode for improved reliability
- **Consistency**: All frontend components now use the same RPC endpoint
- **Backend Alignment**: Backend also updated to use QuickNode infrastructure

### Known Issues
- **Pool Withdrawals**: During high network congestion, withdrawals may take longer to confirm
- **MetaMask**: Ensure you're connected to World Chain network (Chain ID: 480)
- **Rate Limiting**: Public RPC endpoints may have rate limits during peak usage

## Support

If you need support or have any questions, please contact: [ty@siestamarkets.com](mailto:ty@siestamarkets.com)

## Acknowledgements

This project was developed by [siestamarkets.com](https://siestamarkets.com).

Special thanks to the Worldcoin, Supabase, Cloudflare, and OpenZeppelin teams for their technologies and contributions to the ecosystem.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details (ensure a `LICENSE` file exists in the repository).

---

_Last Updated: May 18, 2025_