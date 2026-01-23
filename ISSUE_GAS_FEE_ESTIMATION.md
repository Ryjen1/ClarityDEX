# Issue: Add Gas Fee Estimation for Swaps

## Description
Currently, users performing swaps on ClarityDEX have no visibility into the gas fees they will incur before executing the transaction. This can lead to unexpected costs, especially for users new to the Stacks ecosystem.

## Problem
- Users cannot preview gas costs before swapping
- Potential for high fees to surprise users
- No way to compare gas costs across different swap amounts or token pairs
- Lack of transparency in total transaction costs

## Proposed Solution
Implement gas fee estimation that:
- Estimates gas costs for swap transactions
- Displays estimated fees in STX alongside the swap preview
- Updates in real-time as users change swap parameters
- Provides clear breakdown of fees (network fee + any protocol fees)

## Acceptance Criteria
- Gas fee estimate appears in swap interface
- Estimate updates when amount or token pair changes
- Clear indication of fee currency (STX)
- Fallback handling when estimation fails
- Consistent with existing UI design

## Technical Notes
- Use Stacks.js or similar to estimate transaction fees
- Integrate with existing swap quote system
- Consider caching estimates to avoid excessive API calls
- Handle different network conditions (testnet vs mainnet)