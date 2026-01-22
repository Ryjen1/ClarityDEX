import React, { useState } from 'react';
import { Pool } from '@/lib/amm';

interface StakeInterfaceProps {
  pool: Pool;
  isOpen: boolean;
  onClose: () => void;
  onStake: (amount: number) => Promise<void>;
  onUnstake: (amount: number) => Promise<void>;
  onClaim: () => Promise<void>;
  userLiquidity: number;
}

export function StakeInterface({
  pool,
  isOpen,
  onClose,
  onStake,
  onUnstake,
  onClaim,
  userLiquidity
}: StakeInterfaceProps) {
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  if (!isOpen) return null;

  const handleStake = async () => {
    const amount = parseFloat(stakeAmount);
    if (!amount || amount <= 0 || amount > userLiquidity) return;

    setIsStaking(true);
    try {
      await onStake(amount);
      setStakeAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    const amount = parseFloat(unstakeAmount);
    if (!amount || amount <= 0 || amount > (pool.userStaked || 0)) return;

    setIsUnstaking(true);
    try {
      await onUnstake(amount);
      setUnstakeAmount('');
    } catch (error) {
      console.error('Unstaking failed:', error);
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      await onClaim();
    } catch (error) {
      console.error('Claiming failed:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Stake LP Tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Pool Info */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-sm text-gray-400">Pool</div>
            <div className="font-semibold">
              {token0Name}/{token1Name}
            </div>
          </div>

          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded p-3">
              <div className="text-sm text-gray-400">Your Liquidity</div>
              <div className="font-semibold">{userLiquidity} LP</div>
            </div>
            <div className="bg-gray-800 rounded p-3">
              <div className="text-sm text-gray-400">Staked</div>
              <div className="font-semibold">{pool.userStaked || 0} LP</div>
            </div>
          </div>

          {/* Pending Rewards */}
          {(pool.pendingRewards || 0) > 0 && (
            <div className="bg-green-900 bg-opacity-20 border border-green-500 rounded p-3">
              <div className="text-sm text-green-400">Pending Rewards</div>
              <div className="font-semibold text-green-300">
                {pool.pendingRewards} {pool.rewardToken?.split('.')[1] || 'Tokens'}
              </div>
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="mt-2 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-1 px-3 rounded text-sm"
              >
                {isClaiming ? 'Claiming...' : 'Claim Rewards'}
              </button>
            </div>
          )}

          {/* Stake Section */}
          <div className="bg-gray-800 rounded p-3">
            <div className="text-sm text-gray-400 mb-2">Stake Amount</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="0"
                max={userLiquidity}
                step="0.01"
              />
              <button
                onClick={() => setStakeAmount(userLiquidity.toString())}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
              >
                Max
              </button>
            </div>
            <button
              onClick={handleStake}
              disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0 || parseFloat(stakeAmount) > userLiquidity}
              className="mt-2 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 rounded"
            >
              {isStaking ? 'Staking...' : 'Stake'}
            </button>
          </div>

          {/* Unstake Section */}
          {(pool.userStaked || 0) > 0 && (
            <div className="bg-gray-800 rounded p-3">
              <div className="text-sm text-gray-400 mb-2">Unstake Amount</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={unstakeAmount}
                  onChange={(e) => setUnstakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  min="0"
                  max={pool.userStaked || 0}
                  step="0.01"
                />
                <button
                  onClick={() => setUnstakeAmount((pool.userStaked || 0).toString())}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded text-sm"
                >
                  Max
                </button>
              </div>
              <button
                onClick={handleUnstake}
                disabled={isUnstaking || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || parseFloat(unstakeAmount) > (pool.userStaked || 0)}
                className="mt-2 w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded"
              >
                {isUnstaking ? 'Unstaking...' : 'Unstake'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}