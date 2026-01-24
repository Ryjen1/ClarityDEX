# Block Height Fix and Slippage Protection Enhancement

## Description
This PR fixes critical issues in the ClarityDEX AMM contract and adds slippage protection for swap transactions.

## Changes Made

### Contract Fixes
- **Fixed block-height usage**: Replaced incorrect `block-height` with `stacks-block-height` in all transaction logging (create-pool, add-liquidity, remove-liquidity, swap functions)
- **Added slippage protection**: Added `min-output-amount` parameter to swap function with validation
- **Added error constant**: Defined `ERR_SLIPPAGE_EXCEEDED` for proper error handling

### Frontend Updates
- **Updated swap interface**: Modified to calculate and pass minimum output amount based on slippage tolerance
- **Enhanced error handling**: Improved transaction error messages for slippage failures
- **Parameter ordering**: Fixed function argument order in contract calls

### Documentation
- **Updated README**: Added comprehensive documentation for the new slippage protection feature

## Technical Details

### Block Height Fix
The contract was using `block-height` which is not a valid Clarity built-in variable. Replaced with `stacks-block-height` which returns the current block height as a uint for timestamping transactions.

### Slippage Protection
- Added `min-output-amount` parameter to swap function
- Validates `output-amount-sub-fees >= min-output-amount` before executing swap
- Frontend calculates min output as `estimatedOutput * (1 - slippageTolerance/100)`
- Default slippage tolerance: 0.5%

## Testing
- Contract now compiles without errors
- All block-height references updated consistently
- Slippage validation prevents unfavorable trades

## Breaking Changes
- Swap function signature changed to include `min-output-amount` parameter
- Frontend must pass minimum output amount for all swap transactions

## Acceptance Criteria ✅
- [x] Contract compiles without unresolved variable errors
- [x] All transaction logs use correct `stacks-block-height`
- [x] Swap function includes slippage protection
- [x] Frontend calculates and passes minimum output amounts
- [x] Documentation updated with new features
- [x] Error handling improved for slippage scenarios

## Related Issues
- Fixes compilation errors preventing contract deployment
- Addresses missing slippage protection in swap transactions