"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Pool } from "@/lib/amm";
import { useEffect, useMemo, useState } from "react";
import { TokenSelector } from "./token-selector";
import { TokenMetadata } from "@/lib/token-utils";

export interface SwapProps {
  pools: Pool[];
}

export function Swap({ pools }: SwapProps) {
  const { handleSwap } = useStacks();
  const [fromToken, setFromToken] = useState<string>("STX");
  const [toToken, setToToken] = useState<string>("ST3P49R8XXQWG69S66MZASYPTTGNDKK0WW32RRJDN.mock-token");
  const [fromTokenMetadata, setFromTokenMetadata] = useState<TokenMetadata | undefined>();
  const [toTokenMetadata, setToTokenMetadata] = useState<TokenMetadata | undefined>();
  const [fromAmount, setFromAmount] = useState<number>(0);
  const [estimatedToAmount, setEstimatedToAmount] = useState<bigint>(BigInt(0));

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

    if (fromToken === pool["token-0"]) {
      const deltaX = BigInt(fromAmount);
      // (x-dx) * (y+dy) = k
      // y+dy = k/(x-dx)
      // dy = (k/(x-dx)) - y
      const xMinusDeltaX = x - deltaX;
      const yPlusDeltaY = k / xMinusDeltaX;
      const deltaY = yPlusDeltaY - y;
      const fees = (deltaY * BigInt(pool.fee)) / BigInt(10000);
      const deltaYMinusFees = deltaY - fees;
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
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Amount"
          value={fromAmount}
          onChange={(e) => setFromAmount(parseInt(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">To</span>
        <TokenSelector
          value={toToken}
          onChange={(token, metadata) => {
            setToToken(token);
            setToTokenMetadata(metadata);
          }}
          placeholder="Select to token"
        />
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
