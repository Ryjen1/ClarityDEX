export interface AnalyticsData {
  totalVolume: number;
  totalLiquidity: number;
  totalTVL: number;
  priceHistory: Array<{
    time: string;
    price: number;
  }>;
  volumeHistory: Array<{
    time: string;
    volume: number;
  }>;
  userPortfolio: {
    totalValue: number;
    positions: Array<{
      poolId: string;
      value: number;
      share: string;
    }>;
  };
}

export interface PoolPerformanceMetric {
  id: string;
  "token-0": string;
  "token-1": string;
  fee: number;
  liquidity: number;
  "balance-0": number;
  "balance-1": number;
  totalValue: number;
  token0Name: string;
  token1Name: string;
  feePercentage: string;
  apy: string;
  volume24h: number;
  tvl: number;
}