# How to Test Hyperlinkgrid

You are right to pause! We moved fast. Here is exactly what we built and how to test it safely.

## The Architecture (What we built)

1.  **Public Testnet (Base Sepolia)**:
    *   Instead of running a "local blockchain" (which is hard to connect wallets to), we deployed directly to **Base Sepolia**.
    *   This is a "real" blockchain but uses "fake" ETH.
    *   **Why?** It makes testing with Privy and Metamask much easier because they support Sepolia out of the box.

2.  **MockUSDC**:
    *   Real USDC only exists on Mainnet. On testnets, we need a fake version to test payments.
    *   I deployed a `MockUSDC` contract.
    *   **The Faucet**: I added a secret button in the UI that lets you mint 1,000 fake USDC to your wallet so you can test the "Pay $100" flow.

3.  **The Frontend**:
    *   Runs on your computer (`localhost:3000`).
    *   Talks to the contracts on Base Sepolia.

## Step 1: Fix Privy Configuration

I used a placeholder ID. You need your own:

1.  Go to [dashboard.privy.io](https://dashboard.privy.io/).
2.  Create a new App.
3.  Copy the **App ID**.
4.  Open `apps/web/.env.local` and replace the value:
    ```bash
    NEXT_PUBLIC_PRIVY_APP_ID=your_actual_id_here
    ```
5.  **Important**: In Privy Dashboard -> Embedded Wallets, enable "Email Login" and ensure "Base Sepolia" is enabled in your network settings if applicable (usually enabled by default).

## Step 2: Run the Frontend

1.  Open your terminal in the root of the repo.
2.  Run:
    ```bash
    pnpm dev --filter web
    ```
3.  Open `http://localhost:3000/grid`.

## Step 3: The "End-to-End" Test Loop

1.  **Login**: Click "Log in to Buy". Enter your email. Privy will create a wallet for you behind the scenes.
2.  **Get Gas**:
    *   The Privy wallet is new and empty. It has 0 ETH.
    *   **Problem**: You need ETH to pay for gas (even for the "Approve" transaction).
    *   **Fix**: Copy the address from the top left of the UI (e.g., `0x123...`). Send 0.01 Sepolia ETH to it from your own wallet (the one you used to deploy).
3.  **Get Fake Money**:
    *   Click the small `[TESTNET ONLY] Mint 1000 MockUSDC` button in the UI (under your address).
    *   Wait a few seconds.
4.  **Buy a Tile**:
    *   Pick a color and type a URL (e.g., `https://google.com`).
    *   Click **"Approve & Mint"**.
    *   **Transaction 1 (Approve)**: You permit the Grid contract to spend your MockUSDC.
    *   **Transaction 2 (Mint)**: You pay the 100 MockUSDC and get the Tile.
5.  **Verify**:
    *   Wait ~10 seconds.
    *   The page should auto-refresh (or you can refresh manually).
    *   You should see your colored tile on the grid!

## (Optional) Hardhat Tests

If you want to test the *logic* (rules) without the UI/Blockchain:

1.  Run `pnpm test` in the root.
2.  This runs `packages/contracts/test/Hyperlinkgrid.ts` (if it exists, or we can write one) against a temporary in-memory blockchain.
