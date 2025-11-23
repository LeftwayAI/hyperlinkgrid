# Smart Contract Guide

## Stack
*   **Framework**: Hardhat
*   **Language**: Solidity 0.8.x
*   **Chain**: Base Sepolia (Chain ID: 84532)

## Contracts
1.  **`Hyperlinkgrid.sol`**:
    *   ERC-721 Token.
    *   Sequential Minting (`nextId`).
    *   Payment: 100 USDC (`transferFrom`).
    *   Storage: `tiles` mapping.
2.  **`MockUSDC.sol`**:
    *   Standard ERC-20 Mintable for testing.

## Development
*   **Compile**: `pnpm hardhat compile`
*   **Test**: `pnpm hardhat test`
*   **Deploy**: `pnpm hardhat run scripts/deploy.ts --network base-sepolia`

## Environment Variables
*   `PRIVATE_KEY`: Deployer wallet private key.
*   `BASESCAN_API_KEY`: Verification.
