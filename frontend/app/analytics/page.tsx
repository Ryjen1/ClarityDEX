import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { getAllPools } from "@/lib/amm";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const allPools = await getAllPools();

  return (
    <main className="flex min-h-screen flex-col items-center gap-4 md:gap-8 p-4 md:p-8">
      <h1 className="text-xl md:text-3xl font-bold mb-4 md:mb-8">Analytics Dashboard</h1>
      <div className="w-full max-w-6xl">
        <AnalyticsDashboard pools={allPools} />
      </div>
    </main>
  );
}