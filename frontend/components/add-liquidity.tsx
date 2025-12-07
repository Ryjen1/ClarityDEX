"use client";

import { useStacks } from "@/hooks/use-stacks";
import { Pool } from "@/lib/amm";
import { useState } from "react";

export interface AddLiquidityProps {
  pools: Pool[];
}

export function AddLiquidity({ pools }: AddLiquidityProps) {
  const [selectedPool, setSelectedPool] = useState<Pool>(pools[0]);
  const [amount0, setAmount0] = useState<number>(0);
  const [amount1, setAmount1] = useState<number>(0);
  const { handleAddLiquidity } = useStacks();

  return (
    <div className="flex flex-col max-w-md w-full gap-4 p-6 border border-gray-500 rounded-md">
      <h1 className="text-xl font-bold">Add Liquidity</h1>
      <div className="flex flex-col gap-1">
        <span className="font-bold">Pool ID</span>
        <select
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          onChange={(e) => {
            const poolId = e.target.value;
            setSelectedPool(pools.find((pool) => pool.id === poolId)!);
          }}
        >
          {pools.map((pool) => (
            <option key={pool.id} value={pool.id}>
              {pool.id}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">
          Token 0 ({selectedPool["token-0"].split(".")[1]}) Amount
        </span>
        <input
          type="text"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Token 0"
          value={amount0}
          onChange={(e) => setAmount0(parseInt(e.target.value))}
        />
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-bold">
          Token 1 ({selectedPool["token-1"].split(".")[1]}) Amount
        </span>
        <input
          type="text"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          placeholder="Token 1"
          value={amount1}
          onChange={(e) => setAmount1(parseInt(e.target.value))}
        />
      </div>

      <button
        onClick={() => handleAddLiquidity(selectedPool, amount0, amount1)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Add Liquidity
      </button>
    </div>
  );
}
