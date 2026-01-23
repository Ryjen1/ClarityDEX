# Gas Fee Estimation Feature

## Description
This PR adds gas fee estimation functionality to ClarityDEX, allowing users to see estimated network fees before executing swap transactions.

## Changes Made

### New Files
- `frontend/hooks/use-gas-estimate.ts` - React hook for fetching gas fee estimates from Stacks API
- `tests/use-gas-estimate.test.ts` - Comprehensive tests for the gas estimation hook
- `ISSUE_GAS_FEE_ESTIMATION.md` - Detailed issue description and requirements

### Modified Files
- `frontend/components/swap.tsx` - Integrated gas fee display and fixed existing bugs
- `README.md` - Updated documentation with new feature details

### Key Features
- **Real-time Estimation**: Fetches current fee rates from Stacks testnet API
- **Fallback Handling**: Uses reasonable estimates when API is unavailable
- **UI Integration**: Seamlessly displays fees in the swap interface
- **Error Resilience**: Graceful handling of network failures

## Technical Details

### Gas Estimation Logic
- Fetches transfer fee data from `/v2/fees/transfer` endpoint
- Multiplies base transfer fee by 2x for contract call estimation
- Falls back to 300 microSTX if API fails

### UI Changes
- Added gas fee display below swap output preview
- Only shows when swap amount is entered
- Displays loading states and error messages

### Testing
- Unit tests for all hook states (disabled, loading, success, error)
- Mocked fetch API for reliable testing
- Covers edge cases like network failures

## Screenshots/Mockups
When users enter a swap amount, they now see:
```
Estimated Output: 95.23 STX
Estimated Gas Fee: 200 microSTX
```

## Acceptance Criteria ✅
- [x] Gas fee estimate appears in swap interface
- [x] Estimate updates when amount changes
- [x] Clear indication of fee currency (microSTX)
- [x] Fallback handling when estimation fails
- [x] Consistent with existing UI design
- [x] Comprehensive test coverage
- [x] Documentation updated

## Breaking Changes
None. This is a purely additive feature.

## Testing Instructions
1. Navigate to swap page
2. Enter an amount to swap
3. Verify gas fee estimate appears
4. Test with network disconnected to see fallback behavior

## Related Issues
Closes #ISSUE_GAS_FEE_ESTIMATION