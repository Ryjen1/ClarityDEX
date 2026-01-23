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
        // For now, use a reasonable estimate for contract calls
        // Typical contract call fee on Stacks testnet is around 200-500 microSTX
        // In production, this should be fetched from the network
        const estimatedFee = 300; // microSTX
        setFee(estimatedFee);
      } catch (err) {
        console.error('Gas estimation error:', err);
        setError('Failed to estimate gas fee');
        setFee(0);
      } finally {
        setIsLoading(false);
      }
    };

    estimateFee();
  }, [enabled]);

  return { fee, isLoading, error };
}