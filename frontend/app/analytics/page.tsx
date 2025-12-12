import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { getAllPools } from "@/lib/amm";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const allPools = await getAllPools();

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-24">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <AnalyticsDashboard pools={allPools} />
    </main>
  );
}