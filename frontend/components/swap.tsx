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
  const { handleSwap, transactionState, retryTransaction } = useStacks();
  const [fromToken, setFromToken] = useState<string>(pools[0]["token-0"]);
  const [toToken, setToToken] = useState<string>(pools[0]["token-1"]);
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
    <div className="flex flex-col max-w-xl w-full gap-4 p-4 md:p-6 border rounded-md">
      <h1 className="text-lg md:text-xl font-bold">Swap</h1>

      <div className="flex flex-col gap-2">
        <span className="font-bold text-sm md:text-base">From</span>
        <select
          className="border-2 border-gray-500 rounded-lg px-3 py-2 md:px-4 md:py-2 text-black text-sm md:text-base"
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
        <select
          className="border-2 border-gray-500 rounded-lg px-3 py-2 md:px-4 md:py-2 text-black text-sm md:text-base"
          value={toToken}
          onChange={(token, metadata) => {
            setToToken(token);
            setToTokenMetadata(metadata);
          }}
          placeholder="Select to token"
        />
      </div>

      <span className="text-sm md:text-base">Estimated Output: {estimatedToAmount.toString()}</span>

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
          disabled={estimatedToAmount < 0 || transactionState.status === 'pending'}
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
