"use client";

import { useStacks } from "@/hooks/use-stacks";
import { TokenSelector } from "@/components/token-selector";
import { TokenMetadata } from "@/lib/token-utils";
import { useState } from "react";

export function CreatePool() {
  const { handleCreatePool } = useStacks();
  const [token0, setToken0] = useState<TokenMetadata | null>(null);
  const [token1, setToken1] = useState<TokenMetadata | null>(null);
  const [fee, setFee] = useState(500);

  return (
    <div className="flex flex-col max-w-md w-full gap-4 p-6 border border-gray-500 rounded-md">
      <h1 className="text-xl font-bold">Create New Pool</h1>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Token 0</span>
        <TokenSelector
          value={token0}
          onChange={setToken0}
          placeholder="Select first token"
          excludeTokens={token1 ? [token1.contractAddress] : []}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Token 1</span>
        <TokenSelector
          value={token1}
          onChange={setToken1}
          placeholder="Select second token"
          excludeTokens={token0 ? [token0.contractAddress] : []}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Fee</span>
        <input
          type="number"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Fee (basis points)"
          max={10_000}
          min={0}
          value={fee}
          onChange={(e) => setFee(parseInt(e.target.value))}
        />
      </div>

      <button
        onClick={() => {
          if (token0 && token1) {
            handleCreatePool(token0.contractAddress, token1.contractAddress, fee);
          }
        }}
        disabled={!token0 || !token1}
        className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded"
      >
        Create Pool
      </button>
    </div>
  );
}
