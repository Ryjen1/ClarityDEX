"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Pool } from "@/lib/amm";
import { useEffect, useMemo, useState } from "react";

export interface SwapProps {
  pools: Pool[];
}

export function Swap({ pools }: SwapProps) {
  const { handleSwap } = useStacks();
  const [fromToken, setFromToken] = useState<string>(pools[0]["token-0"]);
  const [toToken, setToToken] = useState<string>(pools[0]["token-1"]);
  const [fromAmount, setFromAmount] = useState<number>(0);
  const [estimatedToAmount, setEstimatedToAmount] = useState<bigint>(BigInt(0));

  const uniqueTokens = pools.reduce((acc, pool) => {
    const token0 = pool["token-0"];
    const token1 = pool["token-1"];

    if (!acc.includes(token0)) {
      acc.push(token0);
    }

    if (!acc.includes(token1)) {
      acc.push(token1);
    }

    return acc;
  }, [] as string[]);

  const toTokensList = useMemo(() => {
    const poolsWithFromToken = pools.filter(
      (pool) => pool["token-0"] === fromToken || pool["token-1"] === fromToken
    );
    const tokensFromPools = poolsWithFromToken.reduce((acc, pool) => {
      const token0 = pool["token-0"];
      const token1 = pool["token-1"];

      if (!acc.includes(token0) && token0 !== fromToken) {
        acc.push(token0);
      }

      if (!acc.includes(token1) && token1 !== fromToken) {
        acc.push(token1);
      }

      return acc;
    }, [] as string[]);

    return tokensFromPools;
  }, [fromToken]);

  function estimateSwapOutput() {
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
    const feesFloat = pool.fee / 10_000;

    if (fromToken === pool["token-0"]) {
      const deltaX = BigInt(fromAmount);
      // (x-dx) * (y+dy) = k
      // y+dy = k/(x-dx)
      // dy = (k/(x-dx)) - y
      const xMinusDeltaX = x - deltaX;
      const yPlusDeltaY = k / xMinusDeltaX;
      const deltaY = yPlusDeltaY - y;
      const deltaYMinusFees =
        deltaY - BigInt(Math.ceil(Number(deltaY) * feesFloat));
      setEstimatedToAmount(deltaYMinusFees);
    } else {
      // (x+dx) * (y-dy) = k
      // x+dx = k/(y-dy)
      // dx = (k/(y-dy)) - x
      const deltaY = BigInt(fromAmount);
      const yMinusDeltaY = y - deltaY;
      const xPlusDeltaX = k / yMinusDeltaY;
      const deltaX = xPlusDeltaX - x;
      const deltaXMinusFees =
        deltaX - BigInt(Math.ceil(Number(deltaX) * feesFloat));
      setEstimatedToAmount(deltaXMinusFees);
    }
  }

  useEffect(() => {
    estimateSwapOutput();
  }, [fromToken, toToken, fromAmount]);

  return (
    <div className="flex flex-col max-w-xl w-full gap-4 p-6 border rounded-md">
      <h1 className="text-xl font-bold">Swap</h1>

      <div className="flex flex-col gap-1">
        <span className="font-bold">From</span>
        <select
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          value={fromToken}
          onChange={(e) => setFromToken(e.target.value)}
        >
          {uniqueTokens.map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
        <input
          type="number"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Amount"
          value={fromAmount}
          onChange={(e) => setFromAmount(parseInt(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">To</span>
        <select
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          value={toToken}
          onChange={(e) => setToToken(e.target.value)}
        >
          {toTokensList.map((token) => (
            <option key={token} value={token}>
              {token}
            </option>
          ))}
        </select>
      </div>

      <span>Estimated Output: {estimatedToAmount.toString()}</span>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded  disabled:bg-gray-700 disabled:cursor-not-allowed"
        disabled={estimatedToAmount < 0}
        onClick={() => {
          const pool = pools.find(
            (p) =>
              (p["token-0"] === fromToken && p["token-1"] === toToken) ||
              (p["token-0"] === toToken && p["token-1"] === fromToken)
          );
          if (!pool) return;

          const zeroForOne = fromToken === pool["token-0"];
          handleSwap(pool, fromAmount, zeroForOne);
        }}
      >
        Swap
      </button>
    </div>
  );
}
