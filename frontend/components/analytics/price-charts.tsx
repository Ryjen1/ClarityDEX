"use client";

interface PriceChartsProps {
  priceHistory: Array<{
    time: string;
    price: number;
  }>;
}

export function PriceCharts({ priceHistory }: PriceChartsProps) {
  if (priceHistory.length === 0) {
    return <div className="text-center py-8">No price data available</div>;
  }

  // Calculate price statistics
  const currentPrice = priceHistory[priceHistory.length - 1].price;
  const startingPrice = priceHistory[0].price;
  const priceChange = currentPrice - startingPrice;
  const priceChangePercent = (priceChange / startingPrice) * 100;
  const maxPrice = Math.max(...priceHistory.map(item => item.price));
  const minPrice = Math.min(...priceHistory.map(item => item.price));

  // Find price trends
  const isBullish = priceChange > 0;
  const volatility = ((maxPrice - minPrice) / startingPrice) * 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Current Price</h3>
          <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          <p className={`text-sm ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
            {isBullish ? '▲' : '▼'} {priceChangePercent.toFixed(2)}% (24h)
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">24h Range</h3>
          <p className="text-lg">${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}</p>
          <p className="text-sm text-gray-400">Volatility: {volatility.toFixed(2)}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Price Change</h3>
          <p className={`text-2xl font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
            {isBullish ? '+' : ''}${priceChange.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
        <div className="h-64 relative">
          {/* Simple line chart visualization */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Chart area */}
            <path
              d={generateChartPath(priceHistory)}
              fill="url(#priceGradient)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              fillOpacity="0.3"
            />

            {/* Price line */}
            <path
              d={generateChartPath(priceHistory)}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />

            {/* Current price indicator */}
            <circle
              cx="95"
              cy={100 - ((currentPrice - minPrice) / (maxPrice - minPrice)) * 90}
              r="3"
              fill="rgb(59, 130, 246)"
            />
          </svg>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{new Date(priceHistory[0].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
          <span>{new Date(priceHistory[priceHistory.length - 1].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Key Metrics</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Open:</span>
                <span>${startingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>High:</span>
                <span>${maxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low:</span>
                <span>${minPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Close:</span>
                <span>${currentPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trend Analysis</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Change:</span>
                <span className={isBullish ? 'text-green-500' : 'text-red-500'}>
                  {priceChangePercent.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Volatility:</span>
                <span>{volatility.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trend:</span>
                <span className={isBullish ? 'text-green-500' : 'text-red-500'}>
                  {isBullish ? 'Bullish' : 'Bearish'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate SVG path for price chart
function generateChartPath(priceHistory: Array<{ time: string; price: number }>) {
  if (priceHistory.length === 0) return "";

  const minPrice = Math.min(...priceHistory.map(item => item.price));
  const maxPrice = Math.max(...priceHistory.map(item => item.price));
  const priceRange = maxPrice - minPrice;

  const points = priceHistory.map((item, index) => {
    const x = (index / (priceHistory.length - 1)) * 90 + 5;
    const y = 100 - ((item.price - minPrice) / priceRange) * 90;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}