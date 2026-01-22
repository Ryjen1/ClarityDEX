# Liquidity Mining and Reward Distribution System Architecture

## Overview

This specification outlines the design for a liquidity mining system integrated with the existing Stacks AMM DEX. The system will reward users for providing liquidity to pools through a separate mining contract that tracks stakes and distributes rewards over time.

## 1. Mining Contract Structure

### Contract Design
- **Separate Contract**: `mining.clar` - A dedicated contract for mining logic to maintain separation of concerns
- **Dependencies**: References the AMM contract for position verification
- **Reward Token**: Configurable per pool, supports any SIP-010 fungible token

### Key Functions
- `create-mining-pool`: Initialize mining for an existing AMM pool
- `stake`: Stake liquidity tokens in mining pool
- `unstake`: Remove staked liquidity and claim rewards
- `claim-rewards`: Claim accumulated rewards without unstaking
- `update-pool-rewards`: Update reward accumulators (can be called by anyone)

## 2. Data Structures

### Mining Pools Map
```clarity
(define-map mining-pools
  (buff 20) ;; pool-id from AMM
  {
    reward-token: principal,
    emission-rate: uint, ;; rewards per block
    last-update-block: uint,
    reward-per-share: uint, ;; accumulator for rewards per staked token
    total-staked: uint, ;; total liquidity staked
    active: bool ;; pool mining status
  }
)
```

### User Stakes Map
```clarity
(define-map user-stakes
  {pool-id: (buff 20), user: principal}
  {
    staked-liquidity: uint,
    reward-debt: uint ;; for reward calculation
  }
)
```

### Additional Maps
- `pool-rewards-claimed`: Track total rewards distributed per pool
- `user-rewards-claimed`: Track user-specific claims for analytics

## 3. Reward Calculation Logic

### Reward Per Share Accumulator Pattern
- **Formula**: `reward-per-share += (blocks-elapsed * emission-rate) / total-staked`
- **User Rewards**: `(user-staked * reward-per-share) - reward-debt`
- **APR Calculation**: `(emission-rate * blocks-per-year * reward-price) / (total-staked * liquidity-price) * 100`

### Time-Based Accrual
- Rewards accrue continuously based on block height
- Updates on stake/unstake/claim operations
- No maximum cap per user - rewards accumulate until claimed

### Emission Rate Management
- Configurable per pool
- Can be updated by contract owner
- Supports different rates for different pools

## 4. Integration Points with AMM

### Stake Function Flow
1. Verify user has sufficient liquidity in AMM position
2. Update pool rewards accumulator
3. Add to user stake
4. Update total staked in pool

### Unstake Function Flow
1. Update pool rewards
2. Calculate pending rewards
3. Transfer rewards to user
4. Reduce user stake
5. Update total staked

### Position Verification
- Cross-contract call to AMM `get-position-liquidity`
- Ensures user cannot stake more than their AMM position
- Prevents over-staking attacks

## 5. Frontend Components

### Extended Pool Type
```typescript
export type MiningPool = Pool & {
  mining: {
    rewardToken: string;
    emissionRate: number;
    apr: number;
    totalStaked: number;
    userStaked?: number;
    userRewards?: number;
  };
};
```

### New Components
- **MiningDashboard**: Overview of user's staked positions and rewards
- **PoolMiningCard**: Enhanced pool card showing mining stats
- **StakeInterface**: Modal for staking liquidity
- **ClaimRewards**: Interface for claiming accumulated rewards
- **APRDisplay**: Visual component showing current APR

### Enhanced Pools List
- Add APR column to existing pools table
- Mining status indicators
- Quick stake/unstake actions

## 6. API Functions

### Read-Only Functions
- `get-mining-pool-info(pool-id)`: Returns mining configuration
- `get-user-mining-info(pool-id, user)`: Returns stake and reward data
- `calculate-pending-rewards(pool-id, user)`: Preview rewards without claiming
- `get-pool-apr(pool-id)`: Calculate current APR

### Public Functions
- `stake(pool-id, amount)`: Stake liquidity tokens
- `unstake(pool-id, amount)`: Unstake and claim rewards
- `claim-rewards(pool-id)`: Claim rewards without unstaking
- `emergency-unstake(pool-id)`: Unstake without claiming (for migrations)

### Admin Functions
- `create-mining-pool(pool-id, reward-token, emission-rate)`
- `update-emission-rate(pool-id, new-rate)`
- `pause-pool-mining(pool-id)`
- `resume-pool-mining(pool-id)`

## 7. Security Considerations

### Access Controls
- **Contract Owner**: Can create pools, update rates, pause mining
- **User Stakes**: Only stake/unstake their own positions
- **Reward Claims**: Only claim their own rewards

### Validation Checks
- **Liquidity Verification**: Cross-contract call to verify AMM positions
- **Token Transfers**: Safe transfer functions with error handling
- **Overflow Protection**: Use checked arithmetic for calculations
- **Reentrancy Guards**: Prevent reentrancy in stake/unstake operations

### Attack Vectors Mitigated
- **Double Staking**: Position verification prevents over-staking
- **Reward Manipulation**: Accumulator pattern prevents manipulation
- **Flash Loan Attacks**: Block-level updates prevent exploitation
- **Front-running**: No sensitive operations vulnerable to ordering

### Emergency Mechanisms
- **Pause Functionality**: Owner can pause mining for any pool
- **Emergency Unstake**: Users can unstake without claiming rewards
- **Migration Support**: Functions to move stakes between contracts

## 8. Implementation Considerations

### Gas Optimization
- Batch reward updates for multiple pools
- Efficient accumulator calculations
- Minimal cross-contract calls

### Scalability
- Support for unlimited pools
- Efficient user lookup via maps
- Event logging for off-chain analytics

### Testing Strategy
- Unit tests for reward calculations
- Integration tests with AMM contract
- Security audits for critical functions
- Fuzz testing for edge cases

### Deployment Plan
1. Deploy mining contract
2. Initialize mining pools for existing AMM pools
3. Update frontend to support mining features
4. Gradual rollout with monitoring

## 9. Future Extensions

### Advanced Features
- **Boosted Rewards**: Multipliers for certain users/tokens
- **Time-Locked Stakes**: Minimum staking periods
- **Reward Token Swaps**: Automatic conversion to desired tokens
- **Governance Integration**: Community-controlled emission rates

### Analytics Integration
- Historical reward data
- User performance metrics
- Pool efficiency analysis
- TVL tracking with mining impact

This specification provides a complete blueprint for implementing liquidity mining on the Stacks AMM DEX, ensuring security, efficiency, and user-friendly integration.