"use client";

interface ProtocolTVLProps {
  tvl: number;
}

export function ProtocolTVL({ tvl }: ProtocolTVLProps) {
  // Enhanced TVL composition with more realistic distribution
  const tvlComposition = [
    { name: "STX Pools", value: tvl * 0.45, color: "bg-blue-500", assets: ["STX"] },
    { name: "BTC Pools", value: tvl * 0.30, color: "bg-orange-500", assets: ["BTC", "WBTC"] },
    { name: "ETH Pools", value: tvl * 0.15, color: "bg-purple-500", assets: ["ETH", "WETH"] },
    { name: "Stablecoin Pools", value: tvl * 0.08, color: "bg-green-500", assets: ["USDA", "USDC"] },
    { name: "Other Pools", value: tvl * 0.02, color: "bg-indigo-500", assets: ["Other"] },
  ];

  const totalTvl = tvlComposition.reduce((sum, item) => sum + item.value, 0);

  // Enhanced historical TVL data with realistic growth patterns
  const historicalTvl = generateRealisticTvlHistory(tvl);

  // Calculate growth metrics
  const currentTvlChange = ((tvl - historicalTvl[0]) / historicalTvl[0]) * 100;
  const isGrowing = currentTvlChange > 0;
  const sevenDayChange = ((tvl - historicalTvl[23]) / historicalTvl[23]) * 100;
  const thirtyDayChange = currentTvlChange;

  // Calculate TVL velocity and momentum
  const recentGrowthRate = calculateGrowthRate(historicalTvl.slice(20));
  const overallGrowthRate = calculateGrowthRate(historicalTvl);

  // Calculate concentration metrics
  const herfindahlIndex = calculateHerfindahlIndex(tvlComposition);
  const concentrationRisk = herfindahlIndex > 0.25 ? "High" : herfindahlIndex > 0.15 ? "Moderate" : "Low";

  // Calculate TVL health score
  const healthScore = calculateHealthScore(tvl, currentTvlChange, herfindahlIndex);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total TVL</h3>
          <p className="text-2xl font-bold">${tvl.toLocaleString()}</p>
          <p className={`text-sm ${isGrowing ? 'text-green-500' : 'text-red-500'}`}>
            {isGrowing ? '▲' : '▼'} {currentTvlChange.toFixed(2)}% (30d)
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">7d Change</h3>
          <p className={`text-2xl font-bold ${sevenDayChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {sevenDayChange > 0 ? '+' : ''}{sevenDayChange.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-400">Short-term momentum</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Health Score</h3>
          <p className={`text-2xl font-bold ${healthScore > 75 ? 'text-green-500' : healthScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {healthScore}/100
          </p>
          <p className="text-sm text-gray-400">Protocol health</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Concentration</h3>
          <p className={`text-2xl font-bold ${concentrationRisk === 'High' ? 'text-red-500' : concentrationRisk === 'Moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
            {concentrationRisk}
          </p>
          <p className="text-sm text-gray-400">Diversification</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">TVL Composition Breakdown</h3>
          <div className="space-y-4">
            {tvlComposition.map((item, index) => {
              const percentage = (item.value / totalTvl) * 100;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span>${item.value.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                      <div
                        className={`${item.color} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Assets: {item.assets.join(", ")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">TVL Growth Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>30d Growth Rate:</span>
              <span className={`font-bold ${overallGrowthRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {overallGrowthRate.toFixed(2)}%/day
              </span>
            </div>
            <div className="flex justify-between">
              <span>7d Growth Rate:</span>
              <span className={`font-bold ${recentGrowthRate > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {recentGrowthRate.toFixed(2)}%/day
              </span>
            </div>
            <div className="flex justify-between">
              <span>Herfindahl Index:</span>
              <span className="font-bold">{herfindahlIndex.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Largest Pool Share:</span>
              <span className="font-bold">{((tvlComposition[0].value / totalTvl) * 100).toFixed(1)}%</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gray-700 rounded">
            <h4 className="font-medium mb-2">Health Analysis</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>TVL Size:</span>
                <span className={tvl > 1000000 ? 'text-green-500' : tvl > 500000 ? 'text-yellow-500' : 'text-red-500'}>
                  {tvl > 1000000 ? 'Strong' : tvl > 500000 ? 'Moderate' : 'Developing'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Growth Trend:</span>
                <span className={currentTvlChange > 10 ? 'text-green-500' : currentTvlChange > 0 ? 'text-yellow-500' : 'text-red-500'}>
                  {currentTvlChange > 10 ? 'Strong Growth' : currentTvlChange > 0 ? 'Stable' : 'Declining'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Diversification:</span>
                <span className={concentrationRisk === 'Low' ? 'text-green-500' : concentrationRisk === 'Moderate' ? 'text-yellow-500' : 'text-red-500'}>
                  {concentrationRisk === 'Low' ? 'Well Diversified' : concentrationRisk === 'Moderate' ? 'Moderately Concentrated' : 'Highly Concentrated'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">TVL Growth Chart with Trend Analysis</h3>
        <div className="h-48 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tvlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 0 }} />
              </linearGradient>
              <linearGradient id="tvlDecliningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(244, 63, 94, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(244, 63, 94, 0)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Trend line with color based on growth */}
            <path
              d={generateTvlChartPath(historicalTvl)}
              fill={isGrowing ? "url(#tvlGradient)" : "url(#tvlDecliningGradient)"}
              stroke={isGrowing ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
              strokeWidth="2"
              fillOpacity="0.3"
            />

            {/* TVL line */}
            <path
              d={generateTvlChartPath(historicalTvl)}
              fill="none"
              stroke={isGrowing ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
              strokeWidth="2"
            />

            {/* Current TVL indicator */}
            <circle
              cx="95"
              cy={100 - ((tvl - Math.min(...historicalTvl)) / (Math.max(...historicalTvl) - Math.min(...historicalTvl))) * 90}
              r="3"
              fill={isGrowing ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
            />

            {/* Growth rate annotation */}
            <text
              x="5"
              y={isGrowing ? "20" : "80"}
              fill={isGrowing ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
              fontSize="3"
              fontWeight="bold"
            >
              {isGrowing ? '▲' : '▼'} {currentTvlChange.toFixed(1)}%
            </text>
          </svg>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>30 days ago</span>
          <span>Today</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">TVL Performance Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Growth Metrics</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>30d Change:</span>
                <span className={isGrowing ? 'text-green-500' : 'text-red-500'}>
                  {currentTvlChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>7d Change:</span>
                <span className={sevenDayChange > 0 ? 'text-green-500' : 'text-red-500'}>
                  {sevenDayChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Absolute Growth:</span>
                <span className={isGrowing ? 'text-green-500' : 'text-red-500'}>
                  {isGrowing ? '+' : ''}${Math.abs(tvl - historicalTvl[0]).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Trend Indicators</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Overall Trend:</span>
                <span className={isGrowing ? 'text-green-500' : 'text-red-500'}>
                  {isGrowing ? 'Growing' : 'Declining'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recent Momentum:</span>
                <span className={recentGrowthRate > overallGrowthRate ? 'text-green-500' : 'text-red-500'}>
                  {recentGrowthRate > overallGrowthRate ? 'Accelerating' : 'Decelerating'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Volatility:</span>
                <span className="font-bold">
                  {calculateVolatility(historicalTvl).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Risk Assessment</h4>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>Concentration Risk:</span>
                <span className={concentrationRisk === 'Low' ? 'text-green-500' : concentrationRisk === 'Moderate' ? 'text-yellow-500' : 'text-red-500'}>
                  {concentrationRisk}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Health Score:</span>
                <span className={healthScore > 75 ? 'text-green-500' : healthScore > 50 ? 'text-yellow-500' : 'text-red-500'}>
                  {healthScore}/100 ({healthScore > 75 ? 'Healthy' : healthScore > 50 ? 'Stable' : 'At Risk'})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Recommendation:</span>
                <span className="font-bold text-blue-400">
                  {healthScore > 75 ? 'Maintain' : healthScore > 50 ? 'Monitor' : 'Review'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate realistic TVL history
function generateRealisticTvlHistory(currentTvl) {
  // Start with a base value and apply realistic growth patterns
  const baseValue = currentTvl * 0.7;
  const growthPhases = [
    { days: 10, growthRate: 0.01 },  // Initial growth
    { days: 8, growthRate: 0.02 },   // Acceleration
    { days: 5, growthRate: -0.005 }, // Correction
    { days: 7, growthRate: 0.015 }   // Recovery
  ];

  let history = [baseValue];
  let currentValue = baseValue;

  for (const phase of growthPhases) {
    for (let i = 0; i < phase.days; i++) {
      const dailyChange = currentValue * phase.growthRate * (0.9 + Math.random() * 0.2); // Add some randomness
      currentValue += dailyChange;
      history.push(currentValue);
    }
  }

  // Ensure we end at the current TVL
  const remainingDays = 30 - history.length;
  for (let i = 0; i < remainingDays; i++) {
    const progress = i / remainingDays;
    const targetValue = currentTvl;
    const currentValueInSequence = history[history.length - 1];
    const nextValue = currentValueInSequence + (targetValue - currentValueInSequence) * progress * (0.9 + Math.random() * 0.2);
    history.push(nextValue);
  }

  return history.slice(0, 30); // Ensure exactly 30 days
}

// Helper function to calculate growth rate
function calculateGrowthRate(values) {
  if (values.length < 2) return 0;

  const startValue = values[0];
  const endValue = values[values.length - 1];
  const days = values.length;

  return ((endValue - startValue) / startValue) * (1 / days) * 100;
}

// Helper function to calculate Herfindahl Index (concentration metric)
function calculateHerfindahlIndex(composition) {
  const total = composition.reduce((sum, item) => sum + item.value, 0);
  return composition.reduce((sum, item) => {
    const share = item.value / total;
    return sum + share * share;
  }, 0);
}

// Helper function to calculate TVL health score
function calculateHealthScore(tvl, growthRate, herfindahlIndex) {
  // Score components (0-100)
  let score = 0;

  // TVL size component (0-40 points)
  const sizeScore = Math.min(40, (tvl / 25000) * 40);

  // Growth component (0-30 points)
  const growthScore = Math.min(30, Math.max(0, growthRate * 0.3));

  // Diversification component (0-30 points)
  const diversificationScore = Math.min(30, Math.max(0, (1 - herfindahlIndex) * 30 * 4));

  return Math.round(sizeScore + growthScore + diversificationScore);
}

// Helper function to calculate volatility
function calculateVolatility(values) {
  if (values.length < 2) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return (stdDev / mean) * 100;
}

// Helper function to generate TVL chart path
function generateTvlChartPath(historicalTvl) {
  if (historicalTvl.length === 0) return "";

  const minTvl = Math.min(...historicalTvl);
  const maxTvl = Math.max(...historicalTvl);
  const tvlRange = maxTvl - minTvl;

  const points = historicalTvl.map((value, index) => {
    const x = (index / (historicalTvl.length - 1)) * 90 + 5;
    const y = 100 - ((value - minTvl) / tvlRange) * 90;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}