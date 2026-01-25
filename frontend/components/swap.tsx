"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Pool } from "@/lib/amm";
import { useEffect, useMemo, useState } from "react";
import { TokenSelector } from "./token-selector";
import { TokenMetadata } from "@/lib/token-utils";
import { useGasEstimate } from "@/hooks/use-gas-estimate";
import { validateSlippageTolerance } from "@/lib/validation";

export interface SwapProps {
  pools: Pool[];
}

export function Swap({ pools }: SwapProps) {
  const { handleSwap, transactionState, retryTransaction } = useStacks();
  const [fromToken, setFromToken] = useState<string>(pools[0]["token-0"]);
  const [toToken, setToToken] = useState<string>(pools[0]["token-1"]);
  const [fromAmount, setFromAmount] = useState<number>(0);
  const [estimatedToAmount, setEstimatedToAmount] = useState<bigint>(BigInt(0));
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [slippageTolerance, setSlippageTolerance] = useState<string>("0.5");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [slippageError, setSlippageError] = useState<string>("");
  const [fromTokenMetadata, setFromTokenMetadata] = useState<TokenMetadata | undefined>();
  const [toTokenMetadata, setToTokenMetadata] = useState<TokenMetadata | undefined>();

  const { fee: estimatedGasFee, isLoading: gasLoading, error: gasError } = useGasEstimate(fromAmount > 0);

  // Estimate the output amount for a swap, matching the contract's calculation
  function estimateSwapOutput() {
    setErrorMessage("");
    const pool = pools.find(
      (p) =>
        (p["token-0"] === fromToken && p["token-1"] === toToken) ||
        (p["token-0"] === toToken && p["token-1"] === fromToken)
    );
    if (!pool) return;

    if (fromAmount === 0) return;

    const x = BigInt(pool["balance-0"]);
    const y = BigInt(pool["balance-1"]);
    const k = x * y;

    let deltaOutput: bigint;
    let priceImpact: number = 0;

    if (fromToken === pool["token-0"]) {
      const deltaX = BigInt(fromAmount);
      const xMinusDeltaX = x - deltaX;
      if (xMinusDeltaX <= 0) {
        setEstimatedToAmount(BigInt(0));
        setPriceImpact(0);
        setErrorMessage("Amount too large for swap");
        return;
      }

      const yPlusDeltaY = k / xMinusDeltaX;
      const deltaY = yPlusDeltaY - y;
      // Calculate fees as per contract: (output * fee) / 10000 using integer division
      const fees = (deltaY * BigInt(pool.fee)) / BigInt(10000);
      deltaOutput = deltaY - fees;
      setEstimatedToAmount(deltaOutput);
    } else {
      const deltaY = BigInt(fromAmount);
      const yMinusDeltaY = y - deltaY;
      if (yMinusDeltaY <= 0) {
        setEstimatedToAmount(BigInt(0));
        setPriceImpact(0);
        setErrorMessage("Amount too large for swap");
        return;
      }
      const xPlusDeltaX = k / yMinusDeltaY;
      const deltaX = xPlusDeltaX - x;
      // Calculate fees as per contract: (output * fee) / 10000 using integer division
      const fees = (deltaX * BigInt(pool.fee)) / BigInt(10000);
      deltaOutput = deltaX - fees;
      setEstimatedToAmount(deltaOutput);
    }
    setPriceImpact(priceImpact);
  }
  useEffect(() => {
    estimateSwapOutput();
  }, [fromToken, toToken, fromAmount]);

  return (
    <div className="flex flex-col max-w-xl w-full gap-4 p-4 md:p-6 border rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-500">
      <h1 className="text-lg md:text-xl font-bold">Swap</h1>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-sm md:text-base">From</span>
        <TokenSelector
          value={fromToken}
          onChange={(token, metadata) => {
            setFromToken(token);
            setFromTokenMetadata(metadata);
          }}
          placeholder="Select from token"
        />
        <input
          type="number"
          className="border-2 border-gray-500 rounded-lg px-3 py-2 md:px-4 md:py-2 text-black text-sm md:text-base"
          placeholder="Amount"
          value={fromAmount}
          onChange={(e) => setFromAmount(parseInt(e.target.value))}
          inputMode="decimal"
        />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-bold text-sm md:text-base">To</span>
        <TokenSelector
          value={toToken}
          onChange={(token, metadata) => {
            setToToken(token);
            setToTokenMetadata(metadata);
          }}
          placeholder="Select to token"
        />
      </div>

      <span className="text-sm md:text-base">Estimated Output: {estimatedToAmount.toString()}</span>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-sm md:text-base">Slippage Tolerance (%)</span>
        <input
          type="text"
          className="border-2 border-gray-500 rounded-lg px-3 py-2 md:px-4 md:py-2 text-black text-sm md:text-base"
          placeholder="0.5"
          value={slippageTolerance}
          onChange={(e) => {
            const value = e.target.value;
            setSlippageTolerance(value);
            const validation = validateSlippageTolerance(value);
            setSlippageError(validation.isValid ? "" : validation.errorMessage || "");
          }}
        />
        {slippageError && (
          <span className="text-red-500 text-sm">{slippageError}</span>
        )}
      </div>

      {fromAmount > 0 && (
        <span className="text-sm md:text-base">
          Estimated Gas Fee: {gasLoading ? 'Loading...' : gasError ? 'Error estimating fee' : `${estimatedGasFee} microSTX`}
        </span>
      )}

      {transactionState.status === 'error' && (
        <div className="text-red-500 text-sm">
          Error: {transactionState.error}
        </div>
      )}

      {transactionState.status === 'success' && (
        <div className="text-green-500 text-sm">
          Transaction successful! TX ID: {transactionState.txId}
        </div>
      )}

      {transactionState.status === 'pending' && (
        <div className="text-yellow-500 text-sm">
          Transaction pending...
        </div>
      )}

      <div className="flex gap-2">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded text-sm md:text-base disabled:bg-gray-700 disabled:cursor-not-allowed"
          disabled={estimatedToAmount < 0 || transactionState.status === 'pending' || !!slippageError}
          onClick={() => {
            const pool = pools.find(
              (p) =>
                (p["token-0"] === fromToken && p["token-1"] === toToken) ||
                (p["token-0"] === toToken && p["token-1"] === fromToken)
            );
            if (!pool) return;

            const zeroForOne = fromToken === pool["token-0"];
            const minOutput = Math.floor(Number(estimatedToAmount) * (1 - parseFloat(slippageTolerance) / 100));
            handleSwap(pool, fromAmount, minOutput, zeroForOne);
          }}
        >
          {transactionState.status === 'pending' ? 'Swapping...' : 'Swap'}
        </button>

        {transactionState.status === 'error' && (
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 md:py-3 md:px-6 rounded text-sm md:text-base"
            onClick={retryTransaction}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
