import { Pool } from "@/lib/amm";
import Link from "next/link";
import { APRDisplay } from "./apr-display";

export interface PoolsListProps {
  pools: Pool[];
  onStakeClick?: (pool: Pool) => void;
}

export function PoolsList({ pools, onStakeClick }: PoolsListProps) {
  return (
    <div className="flex flex-col w-full overflow-x-auto">
      {/* Desktop/Tablet View */}
      <div className="hidden md:grid grid-cols-6 place-items-center w-full bg-gray-900 justify-between p-3 md:p-4 font-semibold text-xs md:text-base">
        <span>ID</span>
        <span>Token Pair</span>
        <span>Fee</span>
        <span>Liquidity</span>
        <span>APR</span>
        <span>Actions</span>
      </div>
      {pools.map((pool) => (
        <PoolListItem
          key={`pool-${pool["token-0"]}-${pool["token-1"]}`}
          pool={pool}
          onStakeClick={onStakeClick}
        />
      ))}

      {/* Mobile View - Card Layout */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {pools.map((pool) => (
          <PoolListItemMobile
            key={`pool-mobile-${pool["token-0"]}-${pool["token-1"]}`}
            pool={pool}
            onStakeClick={onStakeClick}
          />
        ))}
      </div>
    </div>
  );
}

export function PoolListItem({ pool, onStakeClick }: { pool: Pool; onStakeClick?: (pool: Pool) => void }) {
  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];
  const feesInPercentage = pool.fee / 10_000;

  return (
    <div className="hidden md:grid grid-cols-6 place-items-center w-full bg-gray-800 justify-between p-3 md:p-4 text-xs md:text-base">
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
      <APRDisplay apr={pool.apr || 0} />
      <div className="flex gap-2">
        {pool.miningEnabled && onStakeClick && (
          <button
            onClick={() => onStakeClick(pool)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
          >
            Mine
          </button>
        )}
      </div>
    </div>
  );
}

export function PoolListItemMobile({ pool, onStakeClick }: { pool: Pool; onStakeClick?: (pool: Pool) => void }) {
  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];
  const feesInPercentage = pool.fee / 10_000;

  return (
    <div className="bg-gray-800 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <span className="font-semibold">Pool #{pool.id}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-gray-700 px-2 py-1 rounded">{feesInPercentage}% fee</span>
          <APRDisplay apr={pool.apr || 0} />
        </div>
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
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-400">
          {pool["balance-0"]} {token0Name} / {pool["balance-1"]} {token1Name}
        </div>
        {pool.miningEnabled && onStakeClick && (
          <button
            onClick={() => onStakeClick(pool)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
          >
            Mine
          </button>
        )}
      </div>
    </div>
  );
}
