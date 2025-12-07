# ClarityDEX Deployment Guide

Your **ClarityDEX** project is ready for deployment! Here's how to deploy your AMM contracts:

## Prerequisites

1. **Install Clarinet CLI**
   ```bash
   npm install -g @hirosystems/clarinet
   ```

## Deployment Options

### Option 1: Local Devnet (Recommended for Testing)
```bash
# Start local devnet
clarinet devnet start

# In a new terminal, deploy contracts
clarinet deploy --devnet
```

### Option 2: Testnet Deployment
```bash
clarinet deploy --testnet
```

### Option 3: Mainnet Deployment
```bash
clarinet deploy --mainnet
```

## Project Configuration

✅ **Updated for ClarityDEX:**
- `Clarinet.toml` - Project name: `clarity-dex`
- `contracts/amm.clar` - Main AMM contract (ready)
- `contracts/mock-token.clar` - Mock token for testing (ready)
- `deployments/default.*.yaml` - Deployment plans configured

## Contract Functions Available

Your AMM contract provides:
- `create-pool(token-0, token-1, fee)` - Create new trading pairs
- `add-liquidity(token-0, token-1, fee, amounts)` - Add liquidity to pools
- `remove-liquidity(token-0, token-1, fee, liquidity)` - Remove liquidity
- `swap(token-0, token-1, fee, amount, direction)` - Execute token swaps
- `get-swap-quote(token-0, token-1, fee, amount, direction)` - Get swap preview

## Frontend Integration

After deployment, update your frontend with the new contract addresses:
- Update contract addresses in `frontend/lib/amm.ts`
- Configure network settings in `frontend/hooks/use-stacks.ts`

## Next Steps

1. Choose your deployment network (devnet/testnet/mainnet)
2. Run the deployment command
3. Update frontend configuration with deployed contract addresses
4. Test the functionality using the deployed contracts

Your ClarityDEX project is fully configured and ready to deploy!