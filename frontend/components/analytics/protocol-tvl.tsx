"use client";

interface ProtocolTVLProps {
  tvl: number;
}

export function ProtocolTVL({ tvl }: ProtocolTVLProps) {
  // Mock TVL composition data
  const tvlComposition = [
    { name: "STX Pools", value: tvl * 0.45, color: "bg-blue-500" },
    { name: "BTC Pools", value: tvl * 0.30, color: "bg-orange-500" },
    { name: "ETH Pools", value: tvl * 0.15, color: "bg-purple-500" },
    { name: "Other Pools", value: tvl * 0.10, color: "bg-green-500" },
  ];

  const totalTvl = tvlComposition.reduce((sum, item) => sum + item.value, 0);

  // Mock historical TVL data
  const historicalTvl = Array.from({ length: 30 }, (_, i) => {
    const baseValue = tvl * 0.8;
    const growthFactor = 1 + (i / 30) * 0.2 + (Math.sin(i * 0.5) * 0.05);
    return baseValue * growthFactor;
  });

  const currentTvlChange = ((tvl - historicalTvl[0]) / historicalTvl[0]) * 100;
  const isGrowing = currentTvlChange > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total TVL</h3>
          <p className="text-2xl font-bold">${tvl.toLocaleString()}</p>
          <p className={`text-sm ${isGrowing ? 'text-green-500' : 'text-red-500'}`}>
            {isGrowing ? '▲' : '▼'} {currentTvlChange.toFixed(2)}% (30d)
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Pools Count</h3>
          <p className="text-2xl font-bold">4</p>
          <p className="text-sm text-gray-400">Active pools</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">TVL Growth</h3>
          <p className={`text-2xl font-bold ${isGrowing ? 'text-green-500' : 'text-red-500'}`}>
            {isGrowing ? '+' : ''}${Math.abs(tvl - historicalTvl[0]).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">TVL Composition</h3>
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
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">TVL Growth Chart</h3>
        <div className="h-32 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="tvlGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(16, 185, 129, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(16, 185, 129, 0)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            <path
              d={generateTvlChartPath(historicalTvl)}
              fill="url(#tvlGradient)"
              stroke="rgb(16, 185, 129)"
              strokeWidth="2"
              fillOpacity="0.3"
            />

            <path
              d={generateTvlChartPath(historicalTvl)}
              fill="none"
              stroke="rgb(16, 185, 129)"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">TVL Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Composition</h4>
            <div className="space-y-1">
              {tvlComposition.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.name}:</span>
                  <span>{((item.value / totalTvl) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Growth Metrics</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>30d Change:</span>
                <span className={isGrowing ? 'text-green-500' : 'text-red-500'}>
                  {currentTvlChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Trend:</span>
                <span className={isGrowing ? 'text-green-500' : 'text-red-500'}>
                  {isGrowing ? 'Growing' : 'Declining'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to generate TVL chart path
function generateTvlChartPath(historicalTvl: number[]) {
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