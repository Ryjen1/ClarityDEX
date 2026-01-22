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
  const [priceImpact, setPriceImpact] = useState<number>(0);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [errorMessage, setErrorMessage] = useState<string>("");

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
    const feesFloat = pool.fee / 10_000;

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
      const deltaYMinusFees =
        deltaY - BigInt(Math.ceil(Number(deltaY) * feesFloat));
      deltaOutput = deltaYMinusFees;
      // Price impact: (deltaY / (deltaX * (y/x))) - 1
      const spotPrice = Number(y) / Number(x);
      const expectedOutput = deltaX * BigInt(Math.floor(spotPrice * 1e18)) / BigInt(1e18);
      if (expectedOutput > 0) {
        priceImpact = (Number(deltaY) / Number(expectedOutput) - 1) * 100;
      }
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
      const deltaXMinusFees =
        deltaX - BigInt(Math.ceil(Number(deltaX) * feesFloat));
      deltaOutput = deltaXMinusFees;
      // Price impact: (deltaX / (deltaY * (x/y))) - 1
      const spotPrice = Number(x) / Number(y);
      const expectedOutput = deltaY * BigInt(Math.floor(spotPrice * 1e18)) / BigInt(1e18);
      if (expectedOutput > 0) {
        priceImpact = (Number(deltaX) / Number(expectedOutput) - 1) * 100;
      }
    }
    setEstimatedToAmount(deltaOutput);
    setPriceImpact(priceImpact);
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

      <div className="flex flex-col gap-1">
        <span className="font-bold">Slippage Tolerance</span>
        <select
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          value={slippageTolerance}
          onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
        >
          <option value={0.1}>0.1%</option>
          <option value={0.5}>0.5%</option>
          <option value={1.0}>1.0%</option>
        </select>
      </div>

      <span>Estimated Output: {estimatedToAmount.toString()}</span>
      <span>Price Impact: {priceImpact.toFixed(2)}%</span>
      <span>Minimum Received: {Math.floor(Number(estimatedToAmount) * (1 - slippageTolerance / 100))}</span>
      {errorMessage && <span className="text-red-500">{errorMessage}</span>}

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
          const minOutput = Math.floor(Number(estimatedToAmount) * (1 - slippageTolerance / 100));
          handleSwap(pool, fromAmount, minOutput, zeroForOne);
        }}
      >
        Swap
      </button>
    </div>
  );
}
