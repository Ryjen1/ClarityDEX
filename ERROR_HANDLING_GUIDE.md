# Error Handling Guide

This guide explains the comprehensive error handling implemented for failed transactions in the Stacks AMM contract.

## Error Types and Messages

### Contract Errors
The contract now provides specific error codes with user-friendly messages:

- **200**: Pool already exists. Please choose different tokens or fee.
- **201**: Incorrect token ordering. Tokens must be in alphabetical order.
- **202**: Insufficient liquidity to be added. Please increase the amounts.
- **203**: Not enough liquidity owned to withdraw the requested amount.
- **204**: Insufficient liquidity amounts being removed.
- **205**: Insufficient input token amount for swap.
- **206**: Insufficient liquidity in pool for swap.
- **207**: Insufficient amount of token 1 for swap.
- **208**: Insufficient amount of token 0 for swap.
- **209**: Pool does not exist.
- **210**: Invalid fee amount. Fee must be between 0 and 100%.
- **211**: Amount cannot be zero.
- **212**: Token transfer failed. Please check your balance.
- **213**: Unauthorized access.
- **214**: Insufficient token balance.
- **215**: Transaction timed out. Please try again.
- **216**: Network error. Please check your connection.
- **217**: Slippage tolerance exceeded. Please adjust your settings.
- **218**: Invalid function parameters.
- **219**: Contract is paused. Please try again later.

## Transaction Status Tracking

All transactions are now logged in the contract with the following information:
- Transaction ID
- User address
- Action type (create-pool, add-liquidity, remove-liquidity, swap)
- Status (success, failed)
- Error code (if applicable)
- Timestamp

## Frontend Features

### User-Friendly Error Messages
- Error codes from the contract are automatically mapped to readable messages
- Messages provide clear guidance on how to resolve issues

### Transaction Status Indicators
- **Pending**: Shows when transaction is being processed
- **Success**: Confirms successful completion with transaction ID
- **Error**: Displays specific error message

### Retry Mechanisms
- Failed transactions show a "Retry" button
- Users can retry without re-entering data
- Automatic error logging for debugging

### Logging and Monitoring
- All transaction errors are logged to console with timestamps
- Successful transactions are also logged
- User IDs are included for better tracking

## Common Error Scenarios

### Pool Creation
- Ensure tokens are in correct alphabetical order
- Check that fee is between 0-100%
- Verify pool doesn't already exist

### Adding Liquidity
- Ensure amounts are greater than zero
- Check sufficient token balances
- Verify pool exists

### Swapping
- Ensure input amount > 0
- Check sufficient liquidity in pool
- Verify slippage tolerance settings

### Removing Liquidity
- Ensure you own the liquidity amount
- Check that amounts to receive are > 0

## Troubleshooting

If you encounter persistent errors:
1. Check your wallet connection
2. Verify token balances
3. Ensure network connectivity
4. Try refreshing the page
5. Contact support if issues persist

## Development Notes

Error handling is implemented at both contract and frontend levels:
- Contract: Validates inputs and provides specific error codes
- Frontend: Maps errors to messages, shows status, provides retry options
- Logging: Comprehensive logging for monitoring and debugging