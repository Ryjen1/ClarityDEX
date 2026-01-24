# Issue: Fix Incorrect Usage of 'block-height' in Clarity Contract

## Description
The AMM contract (`contracts/amm.clar`) is using `block-height` as a built-in variable, but in Clarity, the correct built-in variable for the current block height is `stacks-block-height`. This causes compilation errors and prevents the contract from deploying or functioning correctly.

## Problem
- Contract uses `block-height` in multiple places (create-pool, add-liquidity, remove-liquidity, swap functions)
- `block-height` is not a valid Clarity built-in variable
- Tests fail with "use of unresolved variable 'block-height'" error
- Contract cannot be deployed in this state

## Proposed Solution
Replace all instances of `block-height` with `stacks-block-height` in the contract.

## Acceptance Criteria
- All occurrences of `block-height` replaced with `stacks-block-height`
- Contract compiles without errors
- Tests pass successfully
- Transaction logging still functions correctly with proper block height timestamps

## Technical Notes
- `stacks-block-height` returns the current block height as a uint
- This is used for timestamping transactions in the transaction-logs map
- No changes needed to frontend or other components

## Files to Modify
- `contracts/amm.clar` (4 occurrences)