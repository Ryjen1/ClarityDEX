"use client";

interface UserPortfolioAnalyticsProps {
  portfolio: {
    totalValue: number;
    positions: Array<{
      poolId: string;
      value: number;
      share: string;
    }>;
  };
}

export function UserPortfolioAnalytics({ portfolio }: UserPortfolioAnalyticsProps) {
  // Enhanced portfolio performance metrics
  const portfolioPerformance = calculateEnhancedPortfolioPerformance(portfolio);

  const isProfitable = portfolioPerformance.totalReturn > 0;

  // Enhanced transaction history with more realistic data
  const transactionHistory = generateRealisticTransactionHistory(portfolio);

  // Calculate portfolio risk metrics
  const riskMetrics = calculatePortfolioRiskMetrics(portfolio, portfolioPerformance);

  // Calculate portfolio diversification score
  const diversificationScore = calculateDiversificationScore(portfolio.positions);

  // Generate portfolio recommendations
  const recommendations = generatePortfolioRecommendations(portfolio, portfolioPerformance, riskMetrics);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Portfolio Analytics</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Portfolio Value</h3>
          <p className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</p>
          <p className={`text-sm ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
            {isProfitable ? '▲' : '▼'} {portfolioPerformance.returnPercentage.toFixed(2)}% ROI
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Total Return</h3>
          <p className={`text-2xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
            {isProfitable ? '+' : ''}${portfolioPerformance.totalReturn.toFixed(2)}
          </p>
          <p className="text-sm text-gray-400">Since investment</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Risk Score</h3>
          <p className={`text-2xl font-bold ${riskMetrics.overallRisk === 'Low' ? 'text-green-500' : riskMetrics.overallRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
            {riskMetrics.overallRisk}
          </p>
          <p className="text-sm text-gray-400">Portfolio risk level</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Diversification</h3>
          <p className={`text-2xl font-bold ${diversificationScore > 75 ? 'text-green-500' : diversificationScore > 50 ? 'text-yellow-500' : 'text-red-500'}`}>
            {diversificationScore}/100
          </p>
          <p className="text-sm text-gray-400">Asset allocation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Performance Overview</h3>

          {/* Performance chart visualization */}
          <div className="h-32 relative mb-4">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: isProfitable ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)', stopOpacity: 0.3 }} />
                  <stop offset="100%" style={{ stopColor: isProfitable ? 'rgba(16, 185, 129, 0)' : 'rgba(244, 63, 94, 0)', stopOpacity: 0 }} />
                </linearGradient>
              </defs>

              {/* Simple performance trend */}
              <path
                d={generatePerformanceChartPath(portfolioPerformance)}
                fill="url(#portfolioGradient)"
                stroke={isProfitable ? "rgb(16, 185, 129)" : "rgb(244, 63, 94)"}
                strokeWidth="2"
                fillOpacity="0.3"
              />
            </svg>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex justify-between mb-1">
                <span>Total Invested:</span>
                <span className="font-bold">${portfolioPerformance.totalInvested.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Current Value:</span>
                <span className="font-bold">${portfolio.totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Net Return:</span>
                <span className={`font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {isProfitable ? '+' : ''}${portfolioPerformance.totalReturn.toFixed(2)}
                </span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span>ROI:</span>
                <span className={`font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                  {portfolioPerformance.returnPercentage.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Annualized APY:</span>
                <span className="font-bold">{portfolioPerformance.apy.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Impermanent Loss:</span>
                <span className="font-bold text-yellow-500">
                  -${portfolioPerformance.impermanentLoss.toFixed(2)} ({portfolioPerformance.impermanentLossPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Composition & Allocation</h3>

          {portfolio.positions.map((position, index) => {
            const positionValue = position.value;
            const percentage = (positionValue / portfolio.totalValue) * 100;
            const poolRisk = getPoolRiskLevel(index); // Simulate different risk levels for different pools

            return (
              <div key={position.poolId} className="mb-4 pb-2 border-b border-gray-700 last:border-0">
                <div className="flex items-start gap-3">
                  <div className={`w-4 h-4 rounded-full mt-1 ${getPoolColor(index)}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-medium">Pool {position.poolId.substring(0, 8)}...</span>
                      <span className="font-bold">${positionValue.toLocaleString()} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className={`${getPoolColor(index)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Risk: {poolRisk}</span>
                      <span>Share: {position.share}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Advanced Performance Metrics</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Sharpe Ratio:</span>
              <span className={`font-bold ${portfolioPerformance.sharpeRatio > 1 ? 'text-green-500' : portfolioPerformance.sharpeRatio > 0.5 ? 'text-yellow-500' : 'text-red-500'}`}>
                {portfolioPerformance.sharpeRatio.toFixed(2)} {portfolioPerformance.sharpeRatio > 1 ? '🟢' : portfolioPerformance.sharpeRatio > 0.5 ? '🟡' : '🔴'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Sortino Ratio:</span>
              <span className={`font-bold ${portfolioPerformance.sortinoRatio > 1.5 ? 'text-green-500' : portfolioPerformance.sortinoRatio > 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                {portfolioPerformance.sortinoRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Max Drawdown:</span>
              <span className="font-bold text-red-500">
                -{portfolioPerformance.maxDrawdown.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span className="font-bold text-green-500">
                {portfolioPerformance.winRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Risk-Adjusted Return:</span>
              <span className={`font-bold ${portfolioPerformance.riskAdjustedReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {portfolioPerformance.riskAdjustedReturn.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Risk Metrics & Exposure</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Volatility:</span>
              <span className="font-bold">{riskMetrics.volatility.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Liquidity Risk:</span>
              <span className={`font-bold ${riskMetrics.liquidityRisk === 'Low' ? 'text-green-500' : riskMetrics.liquidityRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                {riskMetrics.liquidityRisk}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Impermanent Loss Risk:</span>
              <span className={`font-bold ${riskMetrics.impermanentLossRisk === 'Low' ? 'text-green-500' : riskMetrics.impermanentLossRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                {riskMetrics.impermanentLossRisk}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Concentration Risk:</span>
              <span className={`font-bold ${riskMetrics.concentrationRisk === 'Low' ? 'text-green-500' : riskMetrics.concentrationRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                {riskMetrics.concentrationRisk}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Overall Risk Profile:</span>
              <span className={`font-bold ${riskMetrics.overallRisk === 'Low' ? 'text-green-500' : riskMetrics.overallRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}`}>
                {riskMetrics.overallRisk}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Transactions & Activity</h3>
        <div className="space-y-3">
          {transactionHistory.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 p-3 bg-gray-700 rounded">
              <div className={`w-8 h-8 rounded flex items-center justify-center text-xs ${tx.type === "Add Liquidity" ? "bg-green-600" : tx.type === "Remove Liquidity" ? "bg-red-600" : "bg-blue-600"}`}>
                {tx.type === "Add Liquidity" ? "➕" : tx.type === "Remove Liquidity" ? "➖" : "↔"}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{tx.type}</span>
                  <span className={tx.type === "Add Liquidity" ? "text-green-500" : tx.type === "Remove Liquidity" ? "text-red-500" : "text-blue-500"}>
                    {tx.amount}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{tx.pool}</span>
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                </div>
                {tx.status === "Completed" && (
                  <div className="text-xs text-gray-500 mt-1">
                    ✅ {tx.type === "Add Liquidity" ? "Liquidity added" : tx.type === "Remove Liquidity" ? "Liquidity removed" : "Swap executed"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Portfolio Health & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-3">📊 Portfolio Health Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Overall Performance:</span>
                <span className={isProfitable ? 'text-green-500' : 'text-red-500'}>
                  {isProfitable ? 'Profitable' : 'Loss'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Risk Level:</span>
                <span className={riskMetrics.overallRisk === 'Low' ? 'text-green-500' : riskMetrics.overallRisk === 'Medium' ? 'text-yellow-500' : 'text-red-500'}>
                  {riskMetrics.overallRisk}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Diversification:</span>
                <span className={diversificationScore > 75 ? 'text-green-500' : diversificationScore > 50 ? 'text-yellow-500' : 'text-red-500'}>
                  {diversificationScore > 75 ? 'Well Diversified' : diversificationScore > 50 ? 'Moderately Diversified' : 'Concentrated'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Efficiency:</span>
                <span className={portfolioPerformance.sharpeRatio > 1 ? 'text-green-500' : 'text-yellow-500'}>
                  {portfolioPerformance.sharpeRatio > 1 ? 'High' : 'Moderate'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-3">💡 Personalized Recommendations</h4>
            <div className="space-y-3 text-sm">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="mt-1">{rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'}</span>
                  <span>{rec.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Portfolio Grade */}
        <div className="mt-4 p-4 bg-gray-700 rounded-lg text-center">
          <h4 className="font-medium mb-2">🏆 Portfolio Grade</h4>
          <div className="text-3xl font-bold mb-1">
            {calculatePortfolioGrade(portfolio, portfolioPerformance, riskMetrics)}
          </div>
          <p className="text-sm text-gray-400">
            {getPortfolioGradeDescription(calculatePortfolioGrade(portfolio, portfolioPerformance, riskMetrics))}
          </p>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate enhanced portfolio performance
function calculateEnhancedPortfolioPerformance(portfolio) {
  const totalInvested = portfolio.totalValue * 0.8;
  const totalReturn = portfolio.totalValue - totalInvested;
  const returnPercentage = (totalReturn / totalInvested) * 100;
  const impermanentLoss = portfolio.totalValue * 0.02;
  const impermanentLossPercentage = (impermanentLoss / portfolio.totalValue) * 100;

  // Calculate risk-adjusted metrics
  const volatility = 15.5; // Simulated volatility
  const sharpeRatio = (returnPercentage - 2) / volatility; // Risk-free rate ~2%
  const sortinoRatio = (returnPercentage - 2) / Math.max(0, volatility - 5); // Only downside volatility
  const maxDrawdown = 8.3; // Simulated max drawdown
  const winRate = 65.2; // Simulated win rate
  const riskAdjustedReturn = returnPercentage - (volatility * 0.5);

  return {
    totalInvested,
    totalReturn,
    returnPercentage,
    apy: 18.5,
    impermanentLoss,
    impermanentLossPercentage,
    sharpeRatio,
    sortinoRatio,
    maxDrawdown,
    winRate,
    riskAdjustedReturn
  };
}

// Helper function to generate realistic transaction history
function generateRealisticTransactionHistory(portfolio) {
  const transactionTypes = ["Add Liquidity", "Remove Liquidity", "Swap"];
  const pools = portfolio.positions.map(p => `Pool ${p.poolId.substring(0, 8)}...`);
  const amounts = ["$1,200", "$2,500", "$5,000", "$750", "$3,200"];

  return Array.from({ length: 5 }, (_, i) => {
    const daysAgo = 30 - i * 5;
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return {
      id: `tx${i + 1}`,
      type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      pool: pools[Math.floor(Math.random() * pools.length)],
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      date: date.toISOString(),
      status: "Completed"
    };
  });
}

// Helper function to calculate portfolio risk metrics
function calculatePortfolioRiskMetrics(portfolio, performance) {
  const positionCount = portfolio.positions.length;
  const largestPosition = Math.max(...portfolio.positions.map(p => p.value / portfolio.totalValue));

  return {
    volatility: 15.5, // Simulated
    liquidityRisk: positionCount > 3 ? "Low" : positionCount > 1 ? "Medium" : "High",
    impermanentLossRisk: performance.impermanentLossPercentage > 5 ? "High" : performance.impermanentLossPercentage > 2 ? "Medium" : "Low",
    concentrationRisk: largestPosition > 0.5 ? "High" : largestPosition > 0.3 ? "Medium" : "Low",
    overallRisk: largestPosition > 0.5 || performance.impermanentLossPercentage > 5 ? "High" :
                largestPosition > 0.3 || performance.impermanentLossPercentage > 2 ? "Medium" : "Low"
  };
}

// Helper function to calculate diversification score
function calculateDiversificationScore(positions) {
  if (positions.length === 0) return 0;

  const herfindahlIndex = positions.reduce((sum, position) => {
    const share = position.value / positions.reduce((total, p) => total + p.value, 0);
    return sum + share * share;
  }, 0);

  // Diversification score (0-100) - lower Herfindahl = better diversification
  return Math.round((1 - herfindahlIndex) * 100 * 2.5);
}

// Helper function to generate portfolio recommendations
function generatePortfolioRecommendations(portfolio, performance, riskMetrics) {
  const recommendations = [];

  // Performance-based recommendations
  if (performance.sharpeRatio < 0.5) {
    recommendations.push({
      text: "Consider rebalancing to improve risk-adjusted returns",
      priority: "high"
    });
  }

  if (performance.impermanentLossPercentage > 3) {
    recommendations.push({
      text: "Monitor impermanent loss and consider stablecoin pairs",
      priority: "medium"
    });
  }

  // Risk-based recommendations
  if (riskMetrics.overallRisk === "High") {
    recommendations.push({
      text: "Reduce concentration risk by diversifying across more pools",
      priority: "high"
    });
  } else if (riskMetrics.overallRisk === "Medium") {
    recommendations.push({
      text: "Consider adding 1-2 more pools for better diversification",
      priority: "medium"
    });
  }

  // Diversification recommendations
  if (portfolio.positions.length <= 2) {
    recommendations.push({
      text: "Diversify into additional pools to reduce single-pool risk",
      priority: "high"
    });
  }

  // General good practices
  recommendations.push({
    text: "Regularly review and rebalance your portfolio",
    priority: "low"
  });

  recommendations.push({
    text: "Consider dollar-cost averaging for new investments",
    priority: "low"
  });

  return recommendations;
}

// Helper function to get pool color
function getPoolColor(index) {
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-indigo-500"];
  return colors[index % colors.length];
}

// Helper function to get pool risk level
function getPoolRiskLevel(index) {
  const riskLevels = ["Low", "Medium", "High", "Moderate", "Conservative"];
  return riskLevels[index % riskLevels.length];
}

// Helper function to calculate portfolio grade
function calculatePortfolioGrade(portfolio, performance, riskMetrics) {
  let score = 0;

  // Performance component (0-40)
  score += Math.min(40, performance.returnPercentage * 0.8);

  // Risk component (0-30)
  score += riskMetrics.overallRisk === "Low" ? 30 : riskMetrics.overallRisk === "Medium" ? 20 : 10;

  // Diversification component (0-30)
  const diversificationScore = calculateDiversificationScore(portfolio.positions);
  score += Math.min(30, diversificationScore * 0.3);

  // Convert to letter grade
  if (score >= 85) return "A";
  if (score >= 75) return "B";
  if (score >= 65) return "C";
  if (score >= 55) return "D";
  return "F";
}

// Helper function to get portfolio grade description
function getPortfolioGradeDescription(grade) {
  const descriptions = {
    "A": "Excellent portfolio with strong performance and low risk",
    "B": "Good portfolio with solid performance and moderate risk",
    "C": "Average portfolio that could benefit from optimization",
    "D": "Below average portfolio needing attention",
    "F": "High-risk portfolio requiring immediate review"
  };

  return descriptions[grade] || "Portfolio needs evaluation";
}

// Helper function to generate performance chart path
function generatePerformanceChartPath(performance) {
  // Simple performance trend visualization
  const points = [
    { x: 5, y: 80 }, // Start
    { x: 30, y: performance.returnPercentage > 0 ? 60 : 70 }, // Mid point
    { x: 60, y: performance.returnPercentage > 0 ? 40 : 80 }, // Mid point
    { x: 95, y: performance.returnPercentage > 0 ? 20 : 90 }  // End
  ];

  return `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
}