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

  // Find price trends and advanced metrics
  const isBullish = priceChange > 0;
  const volatility = ((maxPrice - minPrice) / startingPrice) * 100;

  // Calculate additional technical indicators
  const averagePrice = priceHistory.reduce((sum, item) => sum + item.price, 0) / priceHistory.length;
  const priceRange = maxPrice - minPrice;
  const rangePercent = (priceRange / averagePrice) * 100;

  // Calculate moving averages (simple 5-period and 10-period)
  const shortMA = calculateMovingAverage(priceHistory, 5);
  const longMA = calculateMovingAverage(priceHistory, 10);

  // Determine trend strength
  const trendStrength = Math.abs(priceChangePercent);
  let trendDescription = "Neutral";
  if (trendStrength > 5) {
    trendDescription = isBullish ? "Strong Bullish" : "Strong Bearish";
  } else if (trendStrength > 2) {
    trendDescription = isBullish ? "Moderate Bullish" : "Moderate Bearish";
  }

  // Calculate support and resistance levels
  const supportLevel = minPrice * 0.98;
  const resistanceLevel = maxPrice * 1.02;

  // Find price patterns
  const isBreakout = currentPrice > resistanceLevel;
  const isBreakdown = currentPrice < supportLevel;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <h3 className="text-lg font-semibold mb-2">Trend Strength</h3>
          <p className="text-xl font-bold">{trendDescription}</p>
          <p className="text-sm text-gray-400">{trendStrength.toFixed(2)}% move</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Price Action</h3>
          <p className={`text-xl font-bold ${isBreakout ? 'text-green-500' : isBreakdown ? 'text-red-500' : 'text-yellow-500'}`}>
            {isBreakout ? 'Breakout' : isBreakdown ? 'Breakdown' : 'Consolidation'}
          </p>
          <p className="text-sm text-gray-400">Pattern detection</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Price Chart with Technical Indicators</h3>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="priceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="bullishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="bearishGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(244, 63, 94, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(244, 63, 94, 0)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Support and Resistance levels */}
            <line
              x1="0"
              y1={100 - ((supportLevel - minPrice) / priceRange) * 90}
              x2="100"
              y2={100 - ((supportLevel - minPrice) / priceRange) * 90}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <line
              x1="0"
              y1={100 - ((resistanceLevel - minPrice) / priceRange) * 90}
              x2="100"
              y2={100 - ((resistanceLevel - minPrice) / priceRange) * 90}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="5,5"
            />

            {/* Chart area with trend coloring */}
            <path
              d={generateChartPath(priceHistory)}
              fill={isBullish ? "url(#bullishGradient)" : "url(#bearishGradient)"}
              stroke={isBullish ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
              strokeWidth="2"
              fillOpacity="0.3"
            />

            {/* Price line */}
            <path
              d={generateChartPath(priceHistory)}
              fill="none"
              stroke={isBullish ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
              strokeWidth="2"
            />

            {/* Moving averages */}
            {shortMA.length > 0 && (
              <path
                d={generateChartPath(shortMA.map((ma, index) => ({ time: priceHistory[index].time, price: ma })))}
                fill="none"
                stroke="rgb(255, 193, 7)"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
            )}
            {longMA.length > 0 && (
              <path
                d={generateChartPath(longMA.map((ma, index) => ({ time: priceHistory[index].time, price: ma })))}
                fill="none"
                stroke="rgb(99, 102, 241)"
                strokeWidth="1"
                strokeDasharray="5,3"
              />
            )}

            {/* Current price indicator */}
            <circle
              cx="95"
              cy={100 - ((currentPrice - minPrice) / priceRange) * 90}
              r="3"
              fill={isBullish ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
            />
          </svg>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{new Date(priceHistory[0].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
          <span>{new Date(priceHistory[priceHistory.length - 1].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
        </div>

        {/* Chart legend */}
        <div className="flex gap-4 text-xs mt-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isBullish ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)" }}></div>
            <span>Price</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span>MA-5</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <span>MA-10</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Key Price Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Open:</span>
              <span className="font-bold">${startingPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>High:</span>
              <span className="font-bold">${maxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Low:</span>
              <span className="font-bold">${minPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Close:</span>
              <span className="font-bold">${currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Average:</span>
              <span className="font-bold">${averagePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Range:</span>
              <span className="font-bold">${priceRange.toFixed(2)} ({rangePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Technical Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Trend:</span>
              <span className={`font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                {isBullish ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Change:</span>
              <span className={`font-bold ${isBullish ? 'text-green-500' : 'text-red-500'}`}>
                {priceChange > 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Volatility:</span>
              <span className="font-bold">{volatility.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Support:</span>
              <span className="font-bold text-blue-400">${supportLevel.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Resistance:</span>
              <span className="font-bold text-purple-400">${resistanceLevel.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Pattern:</span>
              <span className={`font-bold ${isBreakout ? 'text-green-500' : isBreakdown ? 'text-red-500' : 'text-yellow-500'}`}>
                {isBreakout ? 'Breakout' : isBreakdown ? 'Breakdown' : 'Consolidation'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Moving Averages Analysis</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Short-Term (MA-5)</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-bold">${shortMA[shortMA.length - 1]?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Trend:</span>
                <span className={`font-bold ${shortMA.length > 1 && shortMA[shortMA.length - 1] > shortMA[shortMA.length - 2] ? 'text-green-500' : 'text-red-500'}`}>
                  {shortMA.length > 1 && shortMA[shortMA.length - 1] > shortMA[shortMA.length - 2] ? 'Rising' : 'Falling'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Long-Term (MA-10)</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Current:</span>
                <span className="font-bold">${longMA[longMA.length - 1]?.toFixed(2) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Trend:</span>
                <span className={`font-bold ${longMA.length > 1 && longMA[longMA.length - 1] > longMA[longMA.length - 2] ? 'text-green-500' : 'text-red-500'}`}>
                  {longMA.length > 1 && longMA[longMA.length - 1] > longMA[longMA.length - 2] ? 'Rising' : 'Falling'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* MA Crossover signal */}
        {shortMA.length > 0 && longMA.length > 0 && (
          <div className="mt-4 p-3 bg-gray-700 rounded">
            <h4 className="font-medium mb-1">MA Crossover Signal</h4>
            <p className="text-sm">
              {currentPrice > shortMA[shortMA.length - 1] && shortMA[shortMA.length - 1] > longMA[longMA.length - 1]
                ? <span className="text-green-500">🟢 Bullish: Price above both MAs, short MA above long MA</span>
                : currentPrice < shortMA[shortMA.length - 1] && shortMA[shortMA.length - 1] < longMA[longMA.length - 1]
                  ? <span className="text-red-500">🔴 Bearish: Price below both MAs, short MA below long MA</span>
                  : <span className="text-yellow-500">🟡 Neutral: Mixed MA signals</span>
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to calculate moving average
function calculateMovingAverage(priceHistory, period) {
  if (priceHistory.length < period) return [];

  return priceHistory.slice(period - 1).map((_, index) => {
    const slice = priceHistory.slice(index, index + period);
    return slice.reduce((sum, item) => sum + item.price, 0) / period;
  });
}

// Helper function to generate SVG path for price chart
function generateChartPath(priceHistory) {
  if (priceHistory.length === 0) return "";

  const prices = priceHistory.map(item => item.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;

  const points = priceHistory.map((item, index) => {
    const x = (index / (priceHistory.length - 1)) * 90 + 5;
    const y = 100 - ((item.price - minPrice) / priceRange) * 90;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}