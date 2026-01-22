export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value / 100);
}

export function calculatePriceChange(current: number, previous: number): {
  change: number;
  percentage: number;
  isPositive: boolean;
} {
  const change = current - previous;
  const percentage = (change / previous) * 100;
  return {
    change,
    percentage,
    isPositive: change > 0
  };
}

export function generateTimeSeriesData(
  count: number,
  baseValue: number,
  volatility: number = 0.1
): Array<{ time: string; value: number }> {
  const data = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(now.getTime() - (count - i) * 60 * 60 * 1000);
    const randomFactor = 1 + (Math.random() * 2 - 1) * volatility;
    const value = baseValue * randomFactor;

    data.push({
      time: time.toISOString(),
      value: parseFloat(value.toFixed(2))
    });
  }

  return data;
}

export function getTrendIndicator(percentage: number): string {
  if (percentage > 5) return '▲▲';
  if (percentage > 0) return '▲';
  if (percentage < -5) return '▼▼';
  if (percentage < 0) return '▼';
  return '→';
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(2) + 'K';
  }
  return value.toFixed(2);
}