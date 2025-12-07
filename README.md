# ClarityDEX 🚀

ClarityDEX is a decentralized exchange built on the Stacks blockchain, featuring an Automated Market Maker (AMM) protocol for seamless token swapping and liquidity management.

## ✨ Features

- **🔄 Automated Market Making**: Constant product formula (x*y=k)
- **💧 Liquidity Pools**: Create and manage token trading pairs
- **⚡ Swap Trading**: Instant token exchanges with real-time pricing
- **📊 Price Quotes**: Preview swap amounts before execution
- **🔒 Secure**: Built on Stacks blockchain with Clarity smart contracts

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
