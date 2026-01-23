# ClarityDEX 🚀

ClarityDEX is a decentralized exchange built on the Stacks blockchain, featuring an Automated Market Maker (AMM) protocol for seamless token swapping and liquidity management.

## ✨ Features

- **🔄 Automated Market Making**: Constant product formula (x*y=k)
- **💧 Liquidity Pools**: Create and manage token trading pairs
- **⚡ Swap Trading**: Instant token exchanges with real-time pricing
- **📊 Price Quotes**: Preview swap amounts before execution
- **⛽ Gas Fee Estimation**: See estimated network fees before swapping
- **🔒 Secure**: Built on Stacks blockchain with Clarity smart contracts

## Multi-Token Support

ClarityDEX now supports trading with real Stacks fungible tokens (SIP-010 compliant), expanding beyond just STX.

### Token Discovery and Validation

- **Known Tokens**: A curated list of popular tokens (e.g., STX, Mock Token) is available for quick selection.
- **Custom Tokens**: Users can input any valid token contract address in the format `address.contract-name`.
- **Validation**: The system validates tokens by checking for required SIP-010 functions: `get-name`, `get-symbol`, and `get-decimals`.
- **Metadata Fetching**: Upon validation, token metadata (name, symbol, decimals, total supply) is fetched from the contract.

### Usage Instructions

- In the swap interface, select tokens from the dropdown or enter a custom contract address.
- For creating pools, choose any two valid tokens to form a trading pair.
- Ensure the token contract is deployed and accessible on the Stacks testnet.

### Where to look

- Token utilities: [`frontend/lib/token-utils.ts`](frontend/lib/token-utils.ts)
- Token selector component: [`frontend/components/token-selector.tsx`](frontend/components/token-selector.tsx)
- Tests: [`tests/token-utils.test.ts`](tests/token-utils.test.ts)

## Swap Quote Preview Feature

I added a read-only `get-swap-quote` helper to the AMM contract and a `useSwapQuote` hook on the frontend. Together they let the UI ask the pool for an exact output + fee preview before a swap runs.

### Why it matters
- Traders see what they will receive and the fee that gets shaved off.
- No transactions are broadcast just to check pricing.
- It keeps the math consistent because the contract reuses the same x*y=k logic as the live swap.

### Where to look
- Contract function: `contracts/amm.clar` → `get-swap-quote`
- Frontend hook: `frontend/hooks/use-swap-quote.ts`
- Safety net: `tests/amm.test.ts` → "returns swap quotes that match actual swap output"

### Quick demo idea
Type an amount into the swap form, watch the hook surface the preview, then execute the swap and see the on-chain result match the quote.

## Gas Fee Estimation Feature

ClarityDEX now provides real-time gas fee estimation for swap transactions, helping users understand the network costs before executing trades.

### How it works
- Fetches current fee rates from the Stacks network API
- Displays estimated fees in microSTX alongside swap previews
- Updates automatically when swap parameters change
- Falls back to reasonable estimates if network data is unavailable

### Where to look
- Gas estimation hook: [`frontend/hooks/use-gas-estimate.ts`](frontend/hooks/use-gas-estimate.ts)
- Integration in swap UI: [`frontend/components/swap.tsx`](frontend/components/swap.tsx)
- Tests: [`tests/use-gas-estimate.test.ts`](tests/use-gas-estimate.test.ts)

### Usage
When entering a swap amount, the estimated gas fee appears below the output preview, giving users full transparency on total transaction costs.
