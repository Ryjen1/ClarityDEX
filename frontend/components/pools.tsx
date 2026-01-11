import { Pool } from "@/lib/amm";
import { formatTokenAmount } from "@/lib/token-utils";
import Link from "next/link";

export interface PoolsListProps {
  pools: Pool[];
}

export function PoolsList({ pools }: PoolsListProps) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-4 place-items-center w-full bg-gray-900 justify-between p-4 font-semibold">
        <span>ID</span>
        <span>Token Pair</span>
        <span>Fee</span>
        <span>Liquidity</span>
      </div>
      {pools.map((pool) => (
        <PoolListItem
          key={`pool-${pool.token0.contractAddress}-${pool.token1.contractAddress}-${pool.fee}`}
          pool={pool}
        />
      ))}
    </div>
  );
}

export function PoolListItem({ pool }: { pool: Pool }) {
  const feesInPercentage = pool.fee / 10_000;
  const balance0Formatted = formatTokenAmount(pool.balance0, pool.token0.decimals);
  const balance1Formatted = formatTokenAmount(pool.balance1, pool.token1.decimals);

  return (
    <div className="grid grid-cols-4 place-items-center w-full bg-gray-800 justify-between p-4">
      <span>{pool.id.slice(0, 8)}...</span>
      <div className="flex items-center gap-2">
        <Link
          href={`https://explorer.hiro.so/txid/${pool.token0.contractAddress}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300"
        >
          {pool.token0.symbol}
        </Link>{" "}
        /
        <Link
          href={`https://explorer.hiro.so/txid/${pool.token1.contractAddress}?chain=testnet`}
          target="_blank"
          className="text-blue-400 hover:text-blue-300"
        >
          {pool.token1.symbol}
        </Link>
      </div>
      <span>{feesInPercentage}%</span>
      <div className="flex items-center gap-2 text-sm">
        {balance0Formatted} {pool.token0.symbol} / {balance1Formatted} {pool.token1.symbol}
      </div>
    </div>
  );
}
