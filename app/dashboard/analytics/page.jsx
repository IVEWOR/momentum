import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryCharts from "@/components/analytics/HistoryCharts";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  // 1. Fetch ALL tasks ever created
  const allTasks = await prisma.task.findMany({
    where: { userId: user.id },
    orderBy: { workDate: "asc" },
  });

  // 2. Group by Date
  const historyMap = new Map();

  allTasks.forEach((task) => {
    // Format date as YYYY-MM-DD to group
    const dateKey = task.workDate.toISOString().split("T")[0];

    if (!historyMap.has(dateKey)) {
      historyMap.set(dateKey, {
        date: dateKey,
        total: 0,
        completed: 0,
        actualTime: 0,
        estimatedTime: 0,
      });
    }

    const entry = historyMap.get(dateKey);
    entry.total += 1;
    if (task.status) entry.completed += 1;
    entry.actualTime += task.actualTime || 0;
    entry.estimatedTime += task.estimatedTime;
  });

  // Convert to array for Recharts
  const dailyData = Array.from(historyMap.values());

  // 3. Calculate Lifetime Stats
  const totalDays = dailyData.length;
  const lifetimeTasks = allTasks.length;
  const lifetimeCompleted = allTasks.filter((t) => t.status).length;
  const completionRate = lifetimeTasks
    ? Math.round((lifetimeCompleted / lifetimeTasks) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <h1 className="text-3xl font-bold mb-8">Performance History</h1>

      {/* Lifetime Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card title="Total Days" value={totalDays} />
        <Card title="Tasks Completed" value={lifetimeCompleted} />
        <Card title="Completion Rate" value={`${completionRate}%`} />
        <Card
          title="Total Hours Logged"
          value={Math.round(
            allTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0) / 60,
          )}
        />
      </div>

      {/* Charts */}
      <div className="h-[400px] w-full bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
        <h3 className="text-lg font-medium mb-4">
          Productivity Trend (Last 30 Days)
        </h3>
        <HistoryCharts data={dailyData.slice(-30)} />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800">
      <div className="text-zinc-400 text-sm mb-1">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
