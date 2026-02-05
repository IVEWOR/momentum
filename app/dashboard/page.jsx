import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import KPIGrid from "@/components/dashboard/KPIGrid";
import TaskTable from "@/components/dashboard/TaskTable";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  // 1. Determine "Today" (Normalized to midnight)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 2. Fetch Tasks for THIS specific work date
  const tasks = await prisma.task.findMany({
    where: {
      userId: user.id,
      workDate: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // --- NEW CALCULATION LOGIC ---
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status).length;

  // 1. Total Planned Load
  const totalEst = tasks.reduce((acc, t) => acc + t.estimatedTime, 0);

  // 2. Total Time Actually Spent (regardless of outcome)
  const totalAct = tasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);

  // 3. Time LOST (Overruns only)
  // Sum of (Actual - Est) ONLY where Actual > Est
  const totalOverrun = tasks.reduce((acc, t) => {
    if (t.actualTime > t.estimatedTime) {
      return acc + (t.actualTime - t.estimatedTime);
    }
    return acc;
  }, 0);

  // 4. Time SAVED (Efficiency only)
  // Sum of (Est - Actual) ONLY where Actual < Est AND Task is Completed
  const totalSaved = tasks.reduce((acc, t) => {
    if (t.status && t.actualTime < t.estimatedTime) {
      return acc + (t.estimatedTime - t.actualTime);
    }
    return acc;
  }, 0);

  // Execution Score Calculation (Weighted)
  const executionScore =
    totalTasks > 0
      ? Math.round(
          (completed / totalTasks) * 60 +
            (totalOverrun === 0
              ? 40
              : Math.max(0, 40 - (totalOverrun / totalEst) * 100)),
        )
      : 0;

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <div className="text-sm text-zinc-500">
          Tasks reset daily. Past history in Analytics.
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIGrid
          total={totalTasks}
          completed={completed}
          est={totalEst}
          act={totalAct}
          score={executionScore}
          overrun={totalOverrun}
          saved={totalSaved}
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <TaskTable tasks={tasks} />
      </div>
    </div>
  );
}
