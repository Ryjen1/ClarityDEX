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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Trading Volume Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Volume</h3>
          <p className="text-2xl font-bold">${totalVolume.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Average Volume</h3>
          <p className="text-2xl font-bold">${averageVolume.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Peak Volume</h3>
          <p className="text-2xl font-bold">${maxVolume.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Timeline</h3>
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

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Volume Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Volume Range</h4>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Minimum:</span>
                <span>${minVolume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Maximum:</span>
                <span>${maxVolume.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Average:</span>
                <span>${averageVolume.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div>
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
    </div>
  );
}