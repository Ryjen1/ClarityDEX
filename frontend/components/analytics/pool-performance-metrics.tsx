"use client";

import { Pool } from "@/lib/amm";
import { useState } from "react";

interface PoolPerformanceMetricsProps {
  pools: Pool[];
}

export function PoolPerformanceMetrics({ pools }: PoolPerformanceMetricsProps) {
  const [sortBy, setSortBy] = useState<"tvl" | "volume" | "apy">("tvl");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  // Calculate performance metrics for each pool
  const poolMetrics = pools.map(pool => {
    const totalValue = pool["balance-0"] + pool["balance-1"];
    const token0Name = pool["token-0"].split(".")[1];
    const token1Name = pool["token-1"].split(".")[1];
    const feePercentage = (pool.fee / 10000).toFixed(2);

    // Generate more realistic performance data based on pool characteristics
    const baseApy = 10 + (totalValue / 1000000) * 5; // Higher TVL = slightly lower APY
    const volatilityFactor = Math.random() * 0.3;
    const apy = baseApy + volatilityFactor * 20;

    // Volume correlates with TVL and fee structure
    const volume24h = totalValue * 0.5 * (1 + Math.random() * 0.5);
    const volume7d = volume24h * 7 * (0.8 + Math.random() * 0.4);
    const volume30d = volume24h * 30 * (0.7 + Math.random() * 0.6);

    // Calculate utilization ratio
    const utilization = Math.min(0.9, volume24h / totalValue);

    return {
      ...pool,
      totalValue,
      token0Name,
      token1Name,
      feePercentage,
      apy: apy.toFixed(2),
      volume24h: Math.floor(volume24h),
      volume7d: Math.floor(volume7d),
      volume30d: Math.floor(volume30d),
      tvl: totalValue,
      utilization: (utilization * 100).toFixed(1),
      liquidityDepth: Math.floor(totalValue / 1000),
      feeRevenue: Math.floor(volume24h * (pool.fee / 10000))
    };
  });

  // Sort pools based on selected criteria
  const sortedPools = [...poolMetrics].sort((a, b) => {
    switch (sortBy) {
      case "tvl": return b.tvl - a.tvl;
      case "volume": return b.volume24h - a.volume24h;
      case "apy": return parseFloat(b.apy) - parseFloat(a.apy);
      default: return b.tvl - a.tvl;
    }
  });

  // Calculate overall statistics
  const totalTvl = poolMetrics.reduce((sum, pool) => sum + pool.tvl, 0);
  const totalVolume = poolMetrics.reduce((sum, pool) => sum + pool.volume24h, 0);
  const avgApy = poolMetrics.reduce((sum, pool) => sum + parseFloat(pool.apy), 0) / pools.length;
  const totalFeeRevenue = poolMetrics.reduce((sum, pool) => sum + pool.feeRevenue, 0);

  // Get volume based on selected time range
  const getVolumeForRange = (pool: any) => {
    switch (timeRange) {
      case "24h": return pool.volume24h;
      case "7d": return pool.volume7d;
      case "30d": return pool.volume30d;
      default: return pool.volume24h;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Pool Performance Metrics</h2>
        <div className="flex gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("tvl")}
              className={`px-3 py-1 rounded ${sortBy === "tvl" ? "bg-blue-600" : "bg-gray-700"}`}
            >
              Sort by TVL
            </button>
            <button
              onClick={() => setSortBy("volume")}
              className={`px-3 py-1 rounded ${sortBy === "volume" ? "bg-blue-600" : "bg-gray-700"}`}
            >
              Sort by Volume
            </button>
            <button
              onClick={() => setSortBy("apy")}
              className={`px-3 py-1 rounded ${sortBy === "apy" ? "bg-blue-600" : "bg-gray-700"}`}
            >
              Sort by APY
            </button>
          </div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as "24h" | "7d" | "30d")}
            className="bg-gray-700 rounded p-2"
          >
            <option value="24h">24h</option>
            <option value="7d">7d</option>
            <option value="30d">30d</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Total TVL</h3>
          <p className="text-xl font-bold">${totalTvl.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Across {pools.length} pools</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Total Volume ({timeRange})</h3>
          <p className="text-xl font-bold">${totalVolume.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Trading activity</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Avg APY</h3>
          <p className="text-xl font-bold">{avgApy.toFixed(2)}%</p>
          <p className="text-xs text-gray-400">Annual percentage yield</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium mb-1">Total Fee Revenue</h3>
          <p className="text-xl font-bold">${totalFeeRevenue.toLocaleString()}</p>
          <p className="text-xs text-gray-400">24h protocol earnings</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Top Performing Pools</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-3">Rank</th>
                <th className="text-left p-3">Pool</th>
                <th className="text-left p-3">TVL</th>
                <th className="text-left p-3">Volume ({timeRange})</th>
                <th className="text-left p-3">APY</th>
                <th className="text-left p-3">Utilization</th>
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
                  <td className="p-3">${getVolumeForRange(pool).toLocaleString()}</td>
                  <td className="p-3">
                    <span className={parseFloat(pool.apy) > 20 ? "text-green-500" : parseFloat(pool.apy) > 10 ? "text-yellow-500" : "text-orange-500"}>
                      {pool.apy}%
                    </span>
                  </td>
                  <td className="p-3">{pool.utilization}%</td>
                  <td className="p-3">{pool.feePercentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Pool Efficiency Metrics</h3>
          <div className="space-y-4">
            {sortedPools.slice(0, 3).map((pool) => (
              <div key={pool.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{pool.token0Name}/{pool.token1Name}</span>
                  <span className="text-sm text-gray-400">#{sortedPools.indexOf(pool) + 1}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="flex justify-between">
                      <span>Utilization:</span>
                      <span className="font-bold">{pool.utilization}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Liquidity Depth:</span>
                      <span className="font-bold">${pool.liquidityDepth}K</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between">
                      <span>Fee Revenue:</span>
                      <span className="font-bold">${pool.feeRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Volume/TVL:</span>
                      <span className="font-bold">{(pool.volume24h / pool.tvl).toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${pool.utilization}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Liquidity Distribution</h3>
          <div className="space-y-3">
            {sortedPools.slice(0, 5).map((pool, index) => {
              const percentage = (pool.tvl / totalTvl) * 100;
              return (
                <div key={pool.id} className="flex items-center gap-3">
                  <span className="w-4 h-4 bg-blue-500 rounded-full"></span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{pool.token0Name}/{pool.token1Name}</span>
                      <span>${pool.tvl.toLocaleString()} ({percentage.toFixed(1)}%)</span>
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
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Pool Health Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Liquidity Quality</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>High TVL Pools:</span>
                <span className="font-bold">{sortedPools.filter(p => p.tvl > totalTvl * 0.1).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Balanced Pools:</span>
                <span className="font-bold">{sortedPools.filter(p => p.tvl > totalTvl * 0.05 && p.tvl <= totalTvl * 0.1).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Developing Pools:</span>
                <span className="font-bold">{sortedPools.filter(p => p.tvl <= totalTvl * 0.05).length}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Performance Indicators</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>High APY Pools:</span>
                <span className="font-bold text-green-500">{sortedPools.filter(p => parseFloat(p.apy) > 20).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Stable Pools:</span>
                <span className="font-bold text-yellow-500">{sortedPools.filter(p => parseFloat(p.apy) > 10 && parseFloat(p.apy) <= 20).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Conservative Pools:</span>
                <span className="font-bold text-orange-500">{sortedPools.filter(p => parseFloat(p.apy) <= 10).length}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Utilization Metrics</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>High Utilization:</span>
                <span className="font-bold text-green-500">{sortedPools.filter(p => parseFloat(p.utilization) > 50).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Moderate Utilization:</span>
                <span className="font-bold text-yellow-500">{sortedPools.filter(p => parseFloat(p.utilization) > 20 && parseFloat(p.utilization) <= 50).length}</span>
              </div>
              <div className="flex justify-between">
                <span>Low Utilization:</span>
                <span className="font-bold text-orange-500">{sortedPools.filter(p => parseFloat(p.utilization) <= 20).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}