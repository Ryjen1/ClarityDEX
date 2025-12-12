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

  // Mock data for analytics - in a real app, this would come from API calls
  const [analyticsData, setAnalyticsData] = useState({
    totalVolume: 0,
    totalLiquidity: 0,
    totalTVL: 0,
    priceHistory: [],
    volumeHistory: [],
    userPortfolio: {
      totalValue: 0,
      positions: []
    }
  });

  useEffect(() => {
    // Simulate data loading
    const loadAnalyticsData = async () => {
      setIsLoading(true);

      // Calculate total metrics from pools
      const totalVolume = pools.reduce((sum, pool) => sum + (pool["balance-0"] + pool["balance-1"]), 0);
      const totalLiquidity = pools.reduce((sum, pool) => sum + pool.liquidity, 0);
      const totalTVL = pools.reduce((sum, pool) => sum + (pool["balance-0"] + pool["balance-1"]), 0);

      // Generate mock historical data
      const priceHistory = generateMockPriceHistory();
      const volumeHistory = generateMockVolumeHistory();

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
        }
      });

      setIsLoading(false);
    };

    loadAnalyticsData();
  }, [pools]);

  const generateMockPriceHistory = () => {
    const history = [];
    const now = new Date();
    const labels = [];

    for (let i = 0; i < 24; i++) {
      const time = new Date(now.getTime() - (23 - i) * 60 * 60 * 1000);
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left p-2 rounded ${activeTab === "overview" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("pools")}
                className={`w-full text-left p-2 rounded ${activeTab === "pools" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                Pool Performance
              </button>
              <button
                onClick={() => setActiveTab("trading")}
                className={`w-full text-left p-2 rounded ${activeTab === "trading" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                Trading Volume
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`w-full text-left p-2 rounded ${activeTab === "portfolio" ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                My Portfolio
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
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
                  <p className="text-2xl font-bold">${analyticsData.totalVolume.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total Liquidity</h3>
                  <p className="text-2xl font-bold">${analyticsData.totalLiquidity.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">Total TVL</h3>
                  <p className="text-2xl font-bold">${analyticsData.totalTVL.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Price Charts</h3>
                <PriceCharts priceHistory={analyticsData.priceHistory} />
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Protocol TVL</h3>
                <ProtocolTVL tvl={analyticsData.totalTVL} />
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