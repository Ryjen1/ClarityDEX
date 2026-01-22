import React, { useState } from 'react';

interface ClaimRewardsProps {
  pendingRewards: number;
  rewardToken: string;
  onClaim: () => Promise<void>;
  className?: string;
}

export function ClaimRewards({
  pendingRewards,
  rewardToken,
  onClaim,
  className = ''
}: ClaimRewardsProps) {
  const [isClaiming, setIsClaiming] = useState(false);

  const handleClaim = async () => {
    if (pendingRewards <= 0) return;

    setIsClaiming(true);
    try {
      await onClaim();
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const rewardTokenName = rewardToken.split('.')[1] || 'Tokens';

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-400">Pending Rewards</div>
          <div className="text-2xl font-bold text-green-400">
            {pendingRewards.toFixed(4)} {rewardTokenName}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">Reward Token</div>
          <div className="text-sm font-medium">{rewardTokenName}</div>
        </div>
      </div>

      <button
        onClick={handleClaim}
        disabled={isClaiming || pendingRewards <= 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        {isClaiming ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Claiming...
          </div>
        ) : pendingRewards > 0 ? (
          'Claim Rewards'
        ) : (
          'No Rewards Available'
        )}
      </button>
    </div>
  );
}