import React, { useState } from 'react';
import { Pool } from '@/lib/amm';
import { APRDisplay } from './apr-display';
import { StakeInterface } from './stake-interface';
import { ClaimRewards } from './claim-rewards';

interface MiningDashboardProps {
  pools: Pool[];
  userAddress?: string;
  onStake: (poolId: string, amount: number) => Promise<void>;
  onUnstake: (poolId: string, amount: number) => Promise<void>;
  onClaim: (poolId: string) => Promise<void>;
  getUserLiquidity: (pool: Pool) => number;
}

export function MiningDashboard({
  pools,
  userAddress,
  onStake,
  onUnstake,
  onClaim,
  getUserLiquidity
}: MiningDashboardProps) {
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);

  const miningPools = pools.filter(pool => pool.miningEnabled);
  const userStakedPools = miningPools.filter(pool => (pool.userStaked || 0) > 0);
  const availablePools = miningPools.filter(pool => (pool.userStaked || 0) === 0);

  const totalPendingRewards = miningPools.reduce((sum, pool) => sum + (pool.pendingRewards || 0), 0);
  const totalStakedValue = miningPools.reduce((sum, pool) => sum + (pool.userStaked || 0), 0);

  const handleStakeClick = (pool: Pool) => {
    setSelectedPool(pool);
    setIsStakeModalOpen(true);
  };

  const handleStake = async (amount: number) => {
    if (!selectedPool) return;
    await onStake(selectedPool.id, amount);
  };

  const handleUnstake = async (amount: number) => {
    if (!selectedPool) return;
    await onUnstake(selectedPool.id, amount);
  };

  const handleClaim = async () => {
    if (!selectedPool) return;
    await onClaim(selectedPool.id);
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Total Staked</div>
          <div className="text-2xl font-bold">{totalStakedValue.toFixed(2)} LP</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Active Pools</div>
          <div className="text-2xl font-bold">{userStakedPools.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400">Pending Rewards</div>
          <div className="text-2xl font-bold text-green-400">
            {totalPendingRewards.toFixed(4)}
          </div>
        </div>
      </div>

      {/* User's Staked Positions */}
      {userStakedPools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Your Mining Positions</h3>
          <div className="space-y-4">
            {userStakedPools.map((pool) => (
              <div key={pool.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">
                      {pool["token-0"].split(".")[1]}/{pool["token-1"].split(".")[1]}
                    </div>
                    <div className="text-sm text-gray-400">Pool #{pool.id}</div>
                  </div>
                  <APRDisplay apr={pool.apr || 0} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-400">Staked</div>
                    <div className="font-semibold">{pool.userStaked} LP</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Pending Rewards</div>
                    <div className="font-semibold text-green-400">
                      {pool.pendingRewards?.toFixed(4) || '0.0000'} {pool.rewardToken?.split('.')[1]}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStakeClick(pool)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                  >
                    Manage Stake
                  </button>
                  {(pool.pendingRewards || 0) > 0 && (
                    <button
                      onClick={() => {
                        setSelectedPool(pool);
                        handleClaim();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Mining Pools */}
      {availablePools.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Available Mining Pools</h3>
          <div className="space-y-4">
            {availablePools.map((pool) => (
              <div key={pool.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold">
                      {pool["token-0"].split(".")[1]}/{pool["token-1"].split(".")[1]}
                    </div>
                    <div className="text-sm text-gray-400">Pool #{pool.id}</div>
                  </div>
                  <APRDisplay apr={pool.apr || 0} />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-400">Total Staked</div>
                    <div className="font-semibold">{pool.totalStaked || 0} LP</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Reward Token</div>
                    <div className="font-semibold">{pool.rewardToken?.split('.')[1]}</div>
                  </div>
                </div>

                <button
                  onClick={() => handleStakeClick(pool)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Start Mining
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stake Interface Modal */}
      {selectedPool && (
        <StakeInterface
          pool={selectedPool}
          isOpen={isStakeModalOpen}
          onClose={() => {
            setIsStakeModalOpen(false);
            setSelectedPool(null);
          }}
          onStake={handleStake}
          onUnstake={handleUnstake}
          onClaim={handleClaim}
          userLiquidity={getUserLiquidity(selectedPool)}
        />
      )}
    </div>
  );
}