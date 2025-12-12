import { Pool } from "@/lib/amm";
import Link from "next/link";

export interface PoolsListProps {
  pools: Pool[];
}

export function PoolsList({ pools }: PoolsListProps) {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      {/* Desktop/Tablet View */}
      <div className="hidden md:grid grid-cols-4 place-items-center w-full bg-gray-900 justify-between p-3 md:p-4 font-semibold text-xs md:text-base">
        <span>ID</span>
        <span>Token Pair</span>
        <span>Fee</span>
        <span>Liquidity</span>
      </div>
      {pools.map((pool) => (
        <PoolListItem
          key={`pool-${pool["token-0"]}-${pool["token-1"]}`}
          pool={pool}
        />
      ))}

      {/* Mobile View - Card Layout */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {pools.map((pool) => (
          <PoolListItemMobile
            key={`pool-mobile-${pool["token-0"]}-${pool["token-1"]}`}
            pool={pool}
          />
        ))}
      </div>
    </div>
  );
}

export function PoolListItem({ pool }: { pool: Pool }) {
  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];
  const feesInPercentage = pool.fee / 10_000;

  return (
    <div className="hidden md:grid grid-cols-4 place-items-center w-full bg-gray-800 justify-between p-3 md:p-4 text-xs md:text-base">
      <span>{pool.id}</span>
      <div className="flex items-center gap-2">
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-0"]}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300"
        >
          {token0Name}
        </Link>{" "}
        /
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-1"]}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300"
        >
          {token1Name}
        </Link>
      </div>
      <span>{feesInPercentage}%</span>
      <div className="flex items-center gap-2">
        {pool["balance-0"]} {token0Name} / {pool["balance-1"]} {token1Name}
      </div>
    </div>
  );
}

export function PoolListItemMobile({ pool }: { pool: Pool }) {
  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];
  const feesInPercentage = pool.fee / 10_000;

  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Pool #{pool.id}</span>
        <span className="text-sm bg-gray-700 px-2 py-1 rounded">{feesInPercentage}% fee</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-0"]}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {token0Name}
        </Link>
        <span>/</span>
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-1"]}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300 text-sm"
        >
          {token1Name}
        </Link>
      </div>
      <div className="text-xs text-gray-400">
        {pool["balance-0"]} {token0Name} / {pool["balance-1"]} {token1Name}
      </div>
    </div>
  );
}
