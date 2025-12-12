"use client";

import { Pool } from "@/lib/amm";
import { useState, useEffect } from "react";
import { PoolPerformanceMetrics } from "./analytics/pool-performance-metrics";
import { TradingVolumeAnalytics } from "./analytics/trading-volume-analytics";
import { PriceCharts } from "./analytics/price-charts";
import { ProtocolTVL } from "./analytics/protocol-tvl";
import { UserPortfolioAnalytics } from "./analytics/user-portfolio-analytics";

interface AnalyticsDashboardProps {
  pools: Pool[];
}

export function AnalyticsDashboard({ pools }: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("24h");
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced analytics data structure
  const [analyticsData, setAnalyticsData] = useState({
    totalVolume: 0,
    totalLiquidity: 0,
    totalTVL: 0,
    priceHistory: [],
    volumeHistory: [],
    userPortfolio: {
      totalValue: 0,
      positions: []
    },
    protocolMetrics: {
      activePools: 0,
      totalUsers: 0,
      dailyTransactions: 0,
      healthScore: 0
    },
    keyInsights: []
  });

  useEffect(() => {
    // Simulate data loading with enhanced metrics
    const loadAnalyticsData = async () => {
      setIsLoading(true);

      // Calculate total metrics from pools
      const totalVolume = pools.reduce((sum, pool) => sum + (pool["balance-0"] + pool["balance-1"]), 0);
      const totalLiquidity = pools.reduce((sum, pool) => sum + pool.liquidity, 0);
      const totalTVL = pools.reduce((sum, pool) => sum + (pool["balance-0"] + pool["balance-1"]), 0);

      // Generate enhanced mock data
      const priceHistory = generateMockPriceHistory();
      const volumeHistory = generateMockVolumeHistory();
      const protocolMetrics = generateProtocolMetrics(pools);
      const keyInsights = generateKeyInsights(totalVolume, totalTVL, pools);

      setAnalyticsData({
        totalVolume,
        totalLiquidity,
        totalTVL,
        priceHistory,
        volumeHistory,
        userPortfolio: {
          totalValue: Math.floor(Math.random() * 10000) + 1000,
          positions: pools.slice(0, 3).map(pool => ({
            poolId: pool.id,
            value: Math.floor(Math.random() * 5000) + 1000,
            share: (Math.random() * 100).toFixed(2) + "%"
          }))
        },
        protocolMetrics,
        keyInsights
      });

      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [pools]);

  const generateMockPriceHistory = () => {
    const history = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      history.push({
        time: time.toISOString(),
        price: 100 + Math.sin(i * 0.5) * 20 + Math.random() * 5
      });
    }

    return history;
  };

  const generateMockVolumeHistory = () => {
    const history = [];
    const now = new Date();

    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      history.push({
        time: time.toISOString(),
        volume: Math.floor(Math.random() * 10000) + 5000
      });
    }

    return history;
  };

  const generateProtocolMetrics = (pools) => {
    return {
      activePools: pools.length,
      totalUsers: Math.floor(Math.random() * 500) + 100,
      dailyTransactions: Math.floor(Math.random() * 200) + 50,
      healthScore: calculateProtocolHealthScore(pools)
    };
  };

  const generateKeyInsights = (totalVolume, totalTVL, pools) => {
    const insights = [];

    // Volume insight
    if (totalVolume > 1000000) {
      insights.push({
        title: "High Trading Activity",
        description: `The protocol has processed over $${(totalVolume / 1000000).toFixed(1)}M in volume, indicating strong liquidity and user engagement.`,
        type: "positive"
      });
    }

    // TVL insight
    if (totalTVL > 500000) {
      insights.push({
        title: "Strong TVL Growth",
        description: `Total Value Locked of $${(totalTVL / 1000000).toFixed(1)}M demonstrates confidence in the protocol's security and yield opportunities.`,
        type: "positive"
      });
    }

    // Pool diversity insight
    if (pools.length > 3) {
      insights.push({
        title: "Diverse Pool Offerings",
        description: `With ${pools.length} active pools, users have multiple options for yield generation and risk management.`,
        type: "neutral"
      });
    } else {
      insights.push({
        title: "Pool Expansion Opportunity",
        description: `Adding more pools could attract additional liquidity and diversify risk across the protocol.`,
        type: "opportunity"
      });
    }

    // Add a performance trend insight
    insights.push({
      title: "Positive Market Trends",
      description: "Recent price action and volume patterns suggest favorable market conditions for liquidity providers.",
      type: "positive"
    });

    return insights;
  };

  const calculateProtocolHealthScore = (pools) => {
    // Simple health score calculation based on pool count and diversity
    const poolScore = Math.min(40, pools.length * 10);
    const diversityScore = pools.length > 1 ? Math.min(30, (pools.length / 5) * 30) : 10;
    const baseScore = 30;

    return Math.round(poolScore + diversityScore + baseScore);
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-400">Loading analytics data...</p>
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-semibold mb-4">No Pool Data Available</h3>
        <p className="text-gray-400 mb-6">There are no active pools to display analytics for.</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Enhanced Sidebar with additional navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-xs">📊</span>
              </div>
              <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
            </div>

            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left p-2 rounded flex items-center gap-2 ${activeTab === "overview" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                <span>🏠</span>
                <span>Overview</span>
              </button>
              <button
                onClick={() => setActiveTab("pools")}
                className={`w-full text-left p-2 rounded flex items-center gap-2 ${activeTab === "pools" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                <span>🏊</span>
                <span>Pool Performance</span>
              </button>
              <button
                onClick={() => setActiveTab("trading")}
                className={`w-full text-left p-2 rounded flex items-center gap-2 ${activeTab === "trading" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                <span>📈</span>
                <span>Trading Volume</span>
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`w-full text-left p-2 rounded flex items-center gap-2 ${activeTab === "portfolio" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                <span>👤</span>
                <span>My Portfolio</span>
              </button>
            </nav>

            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Time Range</h4>
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="w-full bg-gray-700 rounded p-2"
              >
                <option value="24h">24 Hours</option>
                <option value="7d">7 Days</option>
                <option value="30d">30 Days</option>
                <option value="90d">90 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Protocol Health Indicator */}
            <div className="mt-6 p-3 bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Protocol Health</h4>
              <div className="flex items-center gap-2">
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${analyticsData.protocolMetrics.healthScore}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold">{analyticsData.protocolMetrics.healthScore}/100</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {analyticsData.protocolMetrics.healthScore > 75 ? "Healthy" :
                 analyticsData.protocolMetrics.healthScore > 50 ? "Stable" : "Needs Attention"}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Pools:</span>
                <span className="font-bold">{analyticsData.protocolMetrics.activePools}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Users:</span>
                <span className="font-bold">{analyticsData.protocolMetrics.totalUsers}+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Tx:</span>
                <span className="font-bold">{analyticsData.protocolMetrics.dailyTransactions}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Dashboard Header with Key Metrics */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h2 className="text-2xl font-bold mb-6">Protocol Overview</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-1">Total Volume (24h)</h3>
                    <p className="text-xl font-bold">${analyticsData.totalVolume.toLocaleString()}</p>
                    <p className="text-xs text-green-500">▲ {((Math.random() * 20) + 5).toFixed(1)}% vs yesterday</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-1">Total TVL</h3>
                    <p className="text-xl font-bold">${analyticsData.totalTVL.toLocaleString()}</p>
                    <p className="text-xs text-green-500">▲ {((Math.random() * 15) + 2).toFixed(1)}% (30d)</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-1">Total Liquidity</h3>
                    <p className="text-xl font-bold">${analyticsData.totalLiquidity.toLocaleString()}</p>
                    <p className="text-xs text-blue-500">{analyticsData.protocolMetrics.activePools} active pools</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium mb-1">Protocol Activity</h3>
                    <p className="text-xl font-bold">{analyticsData.protocolMetrics.dailyTransactions}</p>
                    <p className="text-xs text-gray-400">daily transactions</p>
                  </div>
                </div>

                {/* Key Insights Section */}
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3">🔍 Key Insights</h3>
                  <div className="space-y-3">
                    {analyticsData.keyInsights.map((insight, index) => (
                      <div key={index} className="p-3 bg-gray-800 rounded flex items-start gap-3">
                        <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center mt-1">
                          {insight.type === "positive" && <span className="text-green-500">🟢</span>}
                          {insight.type === "neutral" && <span className="text-blue-500">ℹ️</span>}
                          {insight.type === "opportunity" && <span className="text-yellow-500">💡</span>}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{insight.title}</h4>
                          <p className="text-xs text-gray-300">{insight.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Visualizations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Price Charts & Market Trends</h3>
                    <span className="text-sm bg-blue-600 px-2 py-1 rounded">Real-time</span>
                  </div>
                  <PriceCharts priceHistory={analyticsData.priceHistory} />
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Protocol TVL Analysis</h3>
                    <span className="text-sm bg-green-600 px-2 py-1 rounded">Healthy</span>
                  </div>
                  <ProtocolTVL tvl={analyticsData.totalTVL} />
                </div>
              </div>

              {/* Additional Analytics Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">📊 Trading Volume Analytics</h3>
                  <div className="h-32">
                    <TradingVolumeAnalytics volumeHistory={analyticsData.volumeHistory} />
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab("trading")}
                      className="text-blue-400 text-sm hover:underline"
                    >
                      View Full Volume Analytics →
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">🏊 Pool Performance Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Pools:</span>
                      <span className="font-bold">{analyticsData.protocolMetrics.activePools}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg APY:</span>
                      <span className="font-bold text-green-500">{(Math.random() * 20 + 10).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Liquidity:</span>
                      <span className="font-bold">${analyticsData.totalLiquidity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Utilization:</span>
                      <span className="font-bold text-blue-500">{(Math.random() * 30 + 40).toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab("pools")}
                      className="text-blue-400 text-sm hover:underline"
                    >
                      View Full Pool Analytics →
                    </button>
                  </div>
                </div>
              </div>

              {/* User Portfolio Preview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">👤 Your Portfolio Overview</h3>
                  <button
                    onClick={() => setActiveTab("portfolio")}
                    className="text-blue-400 text-sm hover:underline"
                  >
                    View Full Portfolio →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-1">Portfolio Value</h4>
                    <p className="text-lg font-bold">${analyticsData.userPortfolio.totalValue.toLocaleString()}</p>
                    <p className="text-xs text-green-500">▲ {((Math.random() * 15) + 5).toFixed(1)}% (30d)</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-1">Positions</h4>
                    <p className="text-lg font-bold">{analyticsData.userPortfolio.positions.length}</p>
                    <p className="text-xs text-gray-400">active positions</p>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-medium mb-1">Est. APY</h4>
                    <p className="text-lg font-bold text-green-500">{(Math.random() * 15 + 10).toFixed(1)}%</p>
                    <p className="text-xs text-gray-400">annualized return</p>
                  </div>
                </div>

                {/* Portfolio Composition Preview */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium mb-2">Position Allocation</h4>
                  {analyticsData.userPortfolio.positions.slice(0, 3).map((position, index) => {
                    const percentage = (position.value / analyticsData.userPortfolio.totalValue) * 100;
                    return (
                      <div key={position.poolId} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="flex-1 text-sm">
                          Pool {position.poolId.substring(0, 8)}...
                        </div>
                        <div className="text-sm font-bold">
                          {percentage.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          ${position.value.toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "pools" && (
            <PoolPerformanceMetrics pools={pools} />
          )}

          {activeTab === "trading" && (
            <TradingVolumeAnalytics volumeHistory={analyticsData.volumeHistory} />
          )}

          {activeTab === "portfolio" && (
            <UserPortfolioAnalytics portfolio={analyticsData.userPortfolio} />
          )}
        </div>
      </div>
    </div>
  );
}