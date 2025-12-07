"use client";

import { useStacks } from "@/hooks/use-stacks";
import { getUserLiquidity, Pool } from "@/lib/amm";
import { useEffect, useState } from "react";

export interface RemoveLiquidityProps {
  pools: Pool[];
}

export function RemoveLiquidity({ pools }: RemoveLiquidityProps) {
  const { userData, handleRemoveLiquidity } = useStacks();
  const [selectedPool, setSelectedPool] = useState<Pool>(pools[0]);
  const [liquidity, setLiquidity] = useState(0);
  const [userTotalLiquidity, setUserTotalLiquidity] = useState(0);

  async function fetchUserLiquidity() {
    const stxAddress = userData?.profile.stxAddress.testnet;
    if (!stxAddress) return;

    getUserLiquidity(selectedPool, stxAddress).then((liquidity) => {
      setUserTotalLiquidity(liquidity);
    });
  }

  useEffect(() => {
    fetchUserLiquidity();
  }, [selectedPool, userData]);

  return (
    <div className="flex flex-col max-w-md w-full gap-4 p-6 border border-gray-500 rounded-md">
      <h1 className="text-xl font-bold">Remove Liquidity</h1>
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
        <div className="flex items-center justify-between">
          <span className="font-bold">Liquidity</span>
          <span>Max: {userTotalLiquidity}</span>
        </div>
        <input
          type="text"
          className="border-2 border-gray-500 rounded-lg px-4 py-2 text-black"
          value={liquidity}
          onChange={(e) => setLiquidity(parseInt(e.target.value))}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span>
          Withdraw {selectedPool["token-0"].split(".")[1]}:{" "}
          {(liquidity / selectedPool.liquidity) * selectedPool["balance-0"]}
        </span>
        <span>
          Withdraw {selectedPool["token-1"].split(".")[1]}:{" "}
          {(liquidity / selectedPool.liquidity) * selectedPool["balance-1"]}
        </span>
      </div>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-700 disabled:cursor-not-allowed"
        disabled={liquidity > userTotalLiquidity}
        onClick={() => handleRemoveLiquidity(selectedPool, liquidity)}
      >
        Remove Liquidity
      </button>
    </div>
  );
}
