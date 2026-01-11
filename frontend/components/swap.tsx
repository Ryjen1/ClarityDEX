"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Pool } from "@/lib/amm";
import { TokenMetadata, formatTokenAmount } from "@/lib/token-utils";
import { TokenSelector } from "@/components/token-selector";
import { useEffect, useMemo, useState } from "react";

export interface SwapProps {
  pools: Pool[];
}

export function Swap({ pools }: SwapProps) {
  const { handleSwap } = useStacks();
  const [fromToken, setFromToken] = useState<TokenMetadata | null>(pools[0]?.token0 || null);
  const [toToken, setToToken] = useState<TokenMetadata | null>(pools[0]?.token1 || null);
  const [fromAmount, setFromAmount] = useState<string>("");
  const [estimatedToAmount, setEstimatedToAmount] = useState<string>("");

  const availableTokens = useMemo(() => {
    const tokens = new Map<string, TokenMetadata>();
    pools.forEach((pool) => {
      tokens.set(pool.token0.contractAddress, pool.token0);
      tokens.set(pool.token1.contractAddress, pool.token1);
    });
    return Array.from(tokens.values());
  }, [pools]);

  const availableToTokens = useMemo(() => {
    if (!fromToken) return availableTokens;

    const poolsWithFromToken = pools.filter(
      (pool) =>
        pool.token0.contractAddress === fromToken.contractAddress ||
        pool.token1.contractAddress === fromToken.contractAddress
    );

    const tokens = new Map<string, TokenMetadata>();
    poolsWithFromToken.forEach((pool) => {
      if (pool.token0.contractAddress !== fromToken.contractAddress) {
        tokens.set(pool.token0.contractAddress, pool.token0);
      }
      if (pool.token1.contractAddress !== fromToken.contractAddress) {
        tokens.set(pool.token1.contractAddress, pool.token1);
      }
    });

    return Array.from(tokens.values());
  }, [fromToken, pools]);

  function estimateSwapOutput() {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) === 0) {
      setEstimatedToAmount("");
      return;
    }

    const pool = pools.find(
      (p) =>
        (p.token0.contractAddress === fromToken.contractAddress &&
         p.token1.contractAddress === toToken.contractAddress) ||
        (p.token0.contractAddress === toToken.contractAddress &&
         p.token1.contractAddress === fromToken.contractAddress)
    );

    if (!pool) {
      setEstimatedToAmount("");
      return;
    }

    const x = BigInt(pool.balance0);
    const y = BigInt(pool.balance1);
    const k = x * y;
    const feesFloat = pool.fee / 10_000;

    const fromAmountRaw = parseFloat(fromAmount) * Math.pow(10, fromToken.decimals);

    if (fromToken.contractAddress === pool.token0.contractAddress) {
      const deltaX = BigInt(Math.floor(fromAmountRaw));
      const xMinusDeltaX = x - deltaX;
      if (xMinusDeltaX <= 0) {
        setEstimatedToAmount("");
        return;
      }
      const yPlusDeltaY = k / xMinusDeltaX;
      const deltaY = yPlusDeltaY - y;
      const deltaYMinusFees = deltaY - BigInt(Math.ceil(Number(deltaY) * feesFloat));
      const outputAmount = Number(deltaYMinusFees) / Math.pow(10, toToken.decimals);
      setEstimatedToAmount(outputAmount.toFixed(toToken.decimals));
    } else {
      const deltaY = BigInt(Math.floor(fromAmountRaw));
      const yMinusDeltaY = y - deltaY;
      if (yMinusDeltaY <= 0) {
        setEstimatedToAmount("");
        return;
      }
      const xPlusDeltaX = k / yMinusDeltaY;
      const deltaX = xPlusDeltaX - x;
      const deltaXMinusFees = deltaX - BigInt(Math.ceil(Number(deltaX) * feesFloat));
      const outputAmount = Number(deltaXMinusFees) / Math.pow(10, toToken.decimals);
      setEstimatedToAmount(outputAmount.toFixed(toToken.decimals));
    }
  }

  useEffect(() => {
    estimateSwapOutput();
  }, [fromToken, toToken, fromAmount, pools]);

  return (
    <div className="flex flex-col max-w-xl w-full gap-4 p-6 border rounded-md">
      <h1 className="text-xl font-bold">Swap</h1>

      <div className="flex flex-col gap-1">
        <span className="font-bold">From</span>
        <TokenSelector
          value={fromToken}
          onChange={setFromToken}
          placeholder="Select token to swap from"
          excludeTokens={toToken ? [toToken.contractAddress] : []}
        />
        <input
          type="number"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Amount"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value)}
          step="any"
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-bold">To</span>
        <TokenSelector
          value={toToken}
          onChange={setToToken}
          placeholder="Select token to swap to"
          excludeTokens={fromToken ? [fromToken.contractAddress] : []}
        />
      </div>

      {estimatedToAmount && (
        <span>Estimated Output: {estimatedToAmount}</span>
      )}

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-700 disabled:cursor-not-allowed"
        disabled={!fromToken || !toToken || !fromAmount || !estimatedToAmount || parseFloat(estimatedToAmount) <= 0}
        onClick={() => {
          if (!fromToken || !toToken || !fromAmount) return;

          const pool = pools.find(
            (p) =>
              (p.token0.contractAddress === fromToken.contractAddress &&
               p.token1.contractAddress === toToken.contractAddress) ||
              (p.token0.contractAddress === toToken.contractAddress &&
               p.token1.contractAddress === fromToken.contractAddress)
          );
          if (!pool) return;

          const zeroForOne = fromToken.contractAddress === pool.token0.contractAddress;
          const amount = Math.floor(parseFloat(fromAmount) * Math.pow(10, fromToken.decimals));
          handleSwap(pool, amount, zeroForOne);
        }}
      >
        Swap
      </button>
    </div>
  );
}
