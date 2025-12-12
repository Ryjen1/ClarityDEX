"use client";

import { Pool } from "@/lib/amm";

interface PoolPerformanceMetricsProps {
  pools: Pool[];
}

export function PoolPerformanceMetrics({ pools }: PoolPerformanceMetricsProps) {
  // Calculate performance metrics for each pool
  const poolMetrics = pools.map(pool => {
    const totalValue = pool["balance-0"] + pool["balance-1"];
    const token0Name = pool["token-0"].split(".")[1];
    const token1Name = pool["token-1"].split(".")[1];
    const feePercentage = (pool.fee / 10000).toFixed(2);

    return {
      ...pool,
      totalValue,
      token0Name,
      token1Name,
      feePercentage,
      // Mock performance data
      apy: (Math.random() * 50 + 10).toFixed(2),
      volume24h: Math.floor(Math.random() * 100000) + 50000,
      tvl: totalValue
    };
  });

  // Sort by TVL (Total Value Locked)
  const sortedPools = [...poolMetrics].sort((a, b) => b.tvl - a.tvl);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Pool Performance Metrics</h2>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Pools</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">Pool</th>
                <th className="text-left p-3">TVL</th>
                <th className="text-left p-3">24h Volume</th>
                <th className="text-left p-3">APY</th>
                <th className="text-left p-3">Fee</th>
              </tr>
            </thead>
            <tbody>
              {sortedPools.map((pool, index) => (
                <tr key={pool.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{pool.token0Name}/{pool.token1Name}</span>
                    </div>
                  </td>
                  <td className="p-3">${pool.tvl.toLocaleString()}</td>
                  <td className="p-3">${pool.volume24h.toLocaleString()}</td>
                  <td className="p-3">{pool.apy}%</td>
                  <td className="p-3">{pool.feePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pool Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Total Pools:</span>
              <span className="font-bold">{pools.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total TVL:</span>
              <span className="font-bold">
                ${poolMetrics.reduce((sum, pool) => sum + pool.tvl, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total 24h Volume:</span>
              <span className="font-bold">
                ${poolMetrics.reduce((sum, pool) => sum + pool.volume24h, 0).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Average APY:</span>
              <span className="font-bold">
                {(poolMetrics.reduce((sum, pool) => sum + parseFloat(pool.apy), 0) / pools.length).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Liquidity Distribution</h3>
          <div className="space-y-3">
            {sortedPools.slice(0, 5).map((pool, index) => (
              <div key={pool.id} className="flex items-center gap-3">
                <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>{pool.token0Name}/{pool.token1Name}</span>
                    <span>${pool.tvl.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(pool.tvl / sortedPools[0].tvl) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}