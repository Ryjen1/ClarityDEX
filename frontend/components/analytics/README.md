# Analytics Dashboard

This directory contains all components for the advanced analytics dashboard feature.

## Components

### Main Components
- `analytics-dashboard.tsx` - Main dashboard container with navigation and layout
- `pool-performance-metrics.tsx` - Pool performance analytics and statistics
- `trading-volume-analytics.tsx` - Trading volume charts and metrics
- `price-charts.tsx` - Price history and charting components
- `protocol-tvl.tsx` - Total Value Locked tracking and visualization
- `user-portfolio-analytics.tsx` - User portfolio performance and analytics

### Utility Files
- `types.ts` - TypeScript interfaces and types
- `utils.ts` - Utility functions for data formatting and calculations

## Features

### Pool Performance Metrics
- Top performing pools ranking
- Pool statistics (TVL, volume, APY)
- Liquidity distribution visualization
- Individual pool performance analysis

### Trading Volume Analytics
- Total, average, and peak volume metrics
- Volume timeline visualization
- Peak trading hours identification
- Volume statistics and trends

### Price Charts
- Current price display with change indicators
- 24-hour price range and volatility
- Interactive price chart with SVG visualization
- Price statistics and trend analysis

### Protocol TVL Tracking
- Total Value Locked metrics
- TVL composition breakdown
- TVL growth chart
- Protocol health indicators

### User Portfolio Analytics
- Total portfolio value and ROI
- Individual position performance
- Transaction history
- Portfolio health assessment
- Risk analysis and recommendations

## Usage

The analytics dashboard is accessible via the `/analytics` route and is integrated into the main navigation.

```typescript
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

function AnalyticsPage() {
  const pools = await getAllPools();
  return <AnalyticsDashboard pools={pools} />;
}
```

## Data Flow

1. **Data Fetching**: Pool data is fetched from the AMM contract via the `getAllPools()` function
2. **Data Processing**: Raw pool data is processed into analytics metrics
3. **Visualization**: Processed data is displayed in various chart and metric components
4. **User Interaction**: Users can switch between different analytics views via the sidebar navigation

## Future Enhancements

- Real-time data updates via WebSocket
- Advanced charting with Chart.js integration
- Historical data comparison
- Export functionality for analytics data
- Customizable dashboard layouts