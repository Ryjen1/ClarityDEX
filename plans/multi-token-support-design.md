# Multi-Token Support Design Document

## Overview

The decentralized exchange (DEX) on Stacks implements multi-token support to enable trading between various SIP-010 compliant fungible tokens. This allows users to create liquidity pools and perform swaps with any supported tokens, not limited to STX.

## Acceptance Criteria

- [x] **Support for STX and multiple SIP-010 tokens**: The AMM contract accepts any two SIP-010 compliant tokens for pool creation and swaps.
- [x] **Token metadata fetching and validation**: Frontend utilities can fetch and validate token metadata from contract read-only functions.
- [x] **Dynamic token selection in UI**: Token selector component allows choosing from known tokens or entering custom contract addresses with validation.
- [x] **Pool creation with any two valid tokens**: Users can create pools between any validated token pair.
- [x] **Swap functionality between any token pairs with existing pools**: Swaps work for any token pair that has an active liquidity pool.

## Implementation Details

### Backend (Smart Contracts)

- **AMM Contract**: Uses the `ft-trait` to handle generic SIP-010 tokens, allowing pools to be created with any token pair.
- **Pool Identification**: Pools are uniquely identified by the hash of the two token contracts and the fee rate.
- **Token Ordering**: Ensures consistent ordering of tokens in pools to prevent duplicates.
- **Mock Token**: Provides a sample SIP-010 token for testing purposes.

### Frontend

- **Token Utilities (`token-utils.ts`)**: Defines interfaces for token metadata, maintains a list of known tokens (STX, mock tokens, USDA, wSTX, wETH, sBTC), and provides functions to fetch and validate custom tokens.
- **Token Selector Component**: React component that displays known tokens in a dropdown and allows input of custom token contracts with real-time validation.
- **Integration**: Components for swapping, adding/removing liquidity use the token selector and utilities.

## Status

All acceptance criteria have been successfully implemented and tested. The DEX now fully supports multi-token operations.

## Deviations

No significant deviations from the original design. The implementation closely follows the planned architecture.

## Additional Features Added

- **Custom Token Support**: Beyond known tokens, users can input any valid SIP-010 contract address for trading.
- **Token Validation**: Real-time validation of custom tokens ensures only compliant contracts are accepted.
- **Extended Known Tokens**: Includes popular testnet tokens like USDA, wrapped tokens (wSTX, wETH, sBTC), and mock tokens for development.