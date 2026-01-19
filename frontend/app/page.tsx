import { Swap } from "@/components/swap";
import { getAllPools } from "@/lib/amm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allPools = await getAllPools();

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 md:gap-8 p-4 md:p-8">
      <div className="w-full max-w-4xl">
        {allPools.length > 0 ? <Swap pools={allPools} /> : <p className="text-center">No pools found</p>}
      </div>
    </main>
  );
}
