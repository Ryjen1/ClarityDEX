import React from 'react';

interface APRDisplayProps {
  apr: number;
  className?: string;
}

export function APRDisplay({ apr, className = '' }: APRDisplayProps) {
  const formatAPR = (apr: number) => {
    if (apr >= 1000) {
      return `${(apr / 100).toFixed(0)}%`;
    } else if (apr >= 100) {
      return `${apr.toFixed(1)}%`;
    } else {
      return `${apr.toFixed(2)}%`;
    }
  };

  const getAPRColor = (apr: number) => {
    if (apr >= 100) return 'text-green-400';
    if (apr >= 50) return 'text-yellow-400';
    return 'text-gray-400';
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-gray-500">APR:</span>
      <span className={`font-semibold ${getAPRColor(apr)}`}>
        {formatAPR(apr)}
      </span>
    </div>
  );
}