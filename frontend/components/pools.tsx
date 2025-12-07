import { Pool } from "@/lib/amm";
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
          key={`pool-${pool["token-0"]}-${pool["token-1"]}`}
          pool={pool}
        />
      ))}
    </div>
  );
}

export function PoolListItem({ pool }: { pool: Pool }) {
  const token0Name = pool["token-0"].split(".")[1];
  const token1Name = pool["token-1"].split(".")[1];
  const feesInPercentage = pool.fee / 10_000;

  return (
    <div className="grid grid-cols-4 place-items-center w-full bg-gray-800 justify-between p-4">
      <span>{pool.id}</span>
      <div className="flex items-center gap-2">
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-0"]}?chain=testnet`}
          target="_blank"
        >
          {token0Name}
        </Link>{" "}
        /
        <Link
          href={`https://explorer.hiro.so/txid/${pool["token-1"]}?chain=testnet`}
          target="_blank"
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
