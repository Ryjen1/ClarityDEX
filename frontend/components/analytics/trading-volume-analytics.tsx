"use client";

interface TradingVolumeAnalyticsProps {
  volumeHistory: Array<{
    time: string;
    volume: number;
  }>;
}

export function TradingVolumeAnalytics({ volumeHistory }: TradingVolumeAnalyticsProps) {
  // Calculate statistics
  const totalVolume = volumeHistory.reduce((sum, item) => sum + item.volume, 0);
  const averageVolume = totalVolume / volumeHistory.length;
  const maxVolume = Math.max(...volumeHistory.map(item => item.volume));
  const minVolume = Math.min(...volumeHistory.map(item => item.volume));

  // Find peak hours
  const peakHours = volumeHistory
    .filter(item => item.volume > averageVolume * 1.5)
    .map(item => {
      const date = new Date(item.time);
      return `${date.getHours()}:00`;
    });

  // Calculate additional metrics
  const currentVolume = volumeHistory[volumeHistory.length - 1].volume;
  const startingVolume = volumeHistory[0].volume;
  const volumeChange = currentVolume - startingVolume;
  const volumeChangePercent = (volumeChange / startingVolume) * 100;
  const isTrendingUp = volumeChange > 0;
  const volatility = ((maxVolume - minVolume) / averageVolume) * 100;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Trading Volume Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
          <p className="text-2xl font-bold">${totalVolume.toLocaleString()}</p>
          <p className="text-sm text-gray-400">24h period</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Average Volume</h3>
          <p className="text-2xl font-bold">${averageVolume.toLocaleString()}</p>
          <p className="text-sm text-gray-400">Per hour</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Volatility</h3>
          <p className="text-2xl font-bold">{volatility.toFixed(1)}%</p>
          <p className="text-sm text-gray-400">Volume fluctuation</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Trend</h3>
          <p className={`text-2xl font-bold ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
            {isTrendingUp ? '▲' : '▼'} {Math.abs(volumeChangePercent).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-400">24h change</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Timeline</h3>
        <div className="h-64 relative">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="volumeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: 'rgba(59, 130, 246, 0.3)', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: 'rgba(59, 130, 246, 0)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {/* Chart area */}
            <path
              d={generateVolumeChartPath(volumeHistory)}
              fill="url(#volumeGradient)"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
              fillOpacity="0.3"
            />

            {/* Volume line */}
            <path
              d={generateVolumeChartPath(volumeHistory)}
              fill="none"
              stroke="rgb(59, 130, 246)"
              strokeWidth="2"
            />

            {/* Current volume indicator */}
            <circle
              cx="95"
              cy={100 - ((currentVolume - minVolume) / (maxVolume - minVolume)) * 90}
              r="3"
              fill="rgb(59, 130, 246)"
            />
          </svg>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{new Date(volumeHistory[0].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
          <span>{new Date(volumeHistory[volumeHistory.length - 1].time).toLocaleTimeString([], { hour: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Volume Statistics</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Key Metrics</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-bold">${totalVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-bold">${averageVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span className="font-bold">${currentVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Volatility:</span>
                  <span className="font-bold">{volatility.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Range</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Minimum:</span>
                  <span className="font-bold">${minVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum:</span>
                  <span className="font-bold">${maxVolume.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-bold">${(maxVolume - minVolume).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trend:</span>
                  <span className={`font-bold ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isTrendingUp ? 'Up' : 'Down'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Trading Patterns</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Peak Hours:</span>
              <span className="font-bold">{peakHours.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Volume Change:</span>
              <span className={`font-bold ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
                {isTrendingUp ? '+' : ''}${volumeChange.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Change %:</span>
              <span className={`font-bold ${isTrendingUp ? 'text-green-500' : 'text-red-500'}`}>
                {volumeChangePercent.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-medium mb-2">Peak Hours</h4>
            <div className="flex flex-wrap gap-2">
              {peakHours.map((hour, index) => (
                <span key={index} className="bg-blue-600 px-2 py-1 rounded text-xs">
                  {hour}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Distribution</h3>
        <div className="space-y-4">
          {volumeHistory.map((item, index) => {
            const date = new Date(item.time);
            const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const volumePercentage = (item.volume / maxVolume) * 100;

            return (
              <div key={index} className="flex items-center gap-4">
                <span className="w-16 text-sm">{timeString}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-4">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${volumePercentage}%` }}
                  ></div>
                </div>
                <span className="w-20 text-sm text-right">${item.volume.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate volume chart path
function generateVolumeChartPath(volumeHistory) {
  if (volumeHistory.length === 0) return "";

  const volumes = volumeHistory.map(item => item.volume);
  const minVolume = Math.min(...volumes);
  const maxVolume = Math.max(...volumes);
  const volumeRange = maxVolume - minVolume;

  const points = volumeHistory.map((item, index) => {
    const x = (index / (volumeHistory.length - 1)) * 90 + 5;
    const y = 100 - ((item.volume - minVolume) / volumeRange) * 90;
    return `${x},${y}`;
  });

  return `M ${points.join(' L ')}`;
}