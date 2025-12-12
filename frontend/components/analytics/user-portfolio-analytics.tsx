"use client";

interface UserPortfolioAnalyticsProps {
  portfolio: {
    totalValue: number;
    positions: Array<{
      poolId: string;
      value: number;
      share: string;
    }>;
  };
}

export function UserPortfolioAnalytics({ portfolio }: UserPortfolioAnalyticsProps) {
  // Mock additional portfolio data
  const portfolioPerformance = {
    totalInvested: portfolio.totalValue * 0.8,
    totalReturn: portfolio.totalValue - portfolio.totalValue * 0.8,
    returnPercentage: 25,
    apy: 18.5,
    impermanentLoss: portfolio.totalValue * 0.02
  };

  const isProfitable = portfolioPerformance.totalReturn > 0;

  // Mock transaction history
  const transactionHistory = [
    {
      id: "tx1",
      type: "Add Liquidity",
      pool: "STX/BTC",
      amount: "$5,000",
      date: "2024-06-15",
      status: "Completed"
    },
    {
      id: "tx2",
      type: "Swap",
      pool: "STX/ETH",
      amount: "$2,500",
      date: "2024-06-10",
      status: "Completed"
    },
    {
      id: "tx3",
      type: "Remove Liquidity",
      pool: "STX/BTC",
      amount: "$1,200",
      date: "2024-05-28",
      status: "Completed"
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Portfolio Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
          <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
          <p className={`text-sm ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
            {isProfitable ? '▲' : '▼'} {portfolioPerformance.returnPercentage.toFixed(2)}% ROI
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Return</h3>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
            {isProfitable ? '+' : ''}${portfolioPerformance.totalReturn.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Since investment</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Average APY</h3>
          <p className="text-2xl font-bold">{portfolioPerformance.apy.toFixed(2)}%</p>
          <p className="text-sm text-gray-400">Annualized return</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Composition</h3>
        <div className="space-y-4">
          {portfolio.positions.map((position, index) => {
            const positionValue = position.value;
            const percentage = (positionValue / portfolio.totalValue) * 100;

            return (
              <div key={position.poolId} className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>Pool {position.poolId.substring(0, 8)}...</span>
                    <span>${positionValue.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Invested:</span>
              <span className="font-bold">${portfolioPerformance.totalInvested.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Value:</span>
              <span className="font-bold">${portfolio.totalValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Net Return:</span>
              <span className={`font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                {isProfitable ? '+' : ''}${portfolioPerformance.totalReturn.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ROI:</span>
              <span className={`font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioPerformance.returnPercentage.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Impermanent Loss:</span>
              <span className="font-bold text-yellow-500">
                -${portfolioPerformance.impermanentLoss.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactionHistory.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-xs">
                  {tx.type === "Add Liquidity" ? "➕" : tx.type === "Remove Liquidity" ? "➖" : "↔"}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{tx.type}</span>
                    <span className={tx.type === "Add Liquidity" ? "text-green-500" : tx.type === "Remove Liquidity" ? "text-red-500" : "text-blue-500"}>
                      {tx.amount}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>{tx.pool}</span>
                    <span>{new Date(tx.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Health</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Risk Assessment</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Diversification:</span>
                <span className="text-green-500">Good</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Impermanent Loss:</span>
                <span className="text-yellow-500">Low</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Liquidity Risk:</span>
                <span className="text-green-500">Low</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Recommendations</h4>
            <div className="space-y-2">
              <div className="text-sm">
                ✅ Diversify across more pools
              </div>
              <div className="text-sm">
                ✅ Consider stablecoin pairs for lower risk
              </div>
              <div className="text-sm">
                ✅ Monitor impermanent loss regularly
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}