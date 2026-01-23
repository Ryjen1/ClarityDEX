import { useState, useEffect } from 'react';

export interface GasEstimate {
  fee: number;
  isLoading: boolean;
  error: string | null;
}

export function useGasEstimate(
  enabled: boolean = true
): GasEstimate {
  const [fee, setFee] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setFee(0);
      setError(null);
      return;
    }

    const estimateFee = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch current fee estimates from Stacks API
        const response = await fetch('https://stacks-node-api.testnet.stacks.co/v2/fees/transfer');
        if (!response.ok) {
          throw new Error('Failed to fetch fee data');
        }
        const feeData = await response.json();

        // Use a multiplier for contract calls (typically higher than transfers)
        const estimatedFee = Math.ceil(feeData.low * 2); // microSTX
        setFee(estimatedFee);
      } catch (err) {
        console.error('Gas estimation error:', err);
        // Fallback to a reasonable estimate
        setError('Using fallback fee estimate');
        setFee(300); // microSTX
      } finally {
        setIsLoading(false);
      }
    };

    estimateFee();
  }, [enabled]);

  return { fee, isLoading, error };
}