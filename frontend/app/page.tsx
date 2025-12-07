import { Swap } from "@/components/swap";
import { getAllPools } from "@/lib/amm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allPools = await getAllPools();

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      {allPools.length > 0 ? <Swap pools={allPools} /> : <p>No pools found</p>}
    </main>
  );
}
