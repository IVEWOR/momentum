import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import KPIGrid from "@/components/dashboard/KPIGrid";
import TaskTable from "@/components/dashboard/TaskTable";
import LogHeader from "@/components/dashboard/LogHeader";

export default async function LogPage({ params }) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const log = await prisma.dailyLog.findUnique({
    where: { id: id, userId: user.id },
  });

  if (!log) notFound();

  const tasks = await prisma.task.findMany({
    where: { dailyLogId: id },
    include: { project: true },
    orderBy: { createdAt: "asc" },
  });

  const projects = await prisma.project.findMany({
    where: { userId: user.id, status: "ACTIVE" },
  });

  // KPI Calculations
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const totalEst = tasks.reduce((acc, t) => acc + t.estimatedTime, 0);
  const totalAct = tasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);

  const overrunTime = tasks.reduce(
    (acc, t) =>
      t.actualTime > t.estimatedTime
        ? acc + (t.actualTime - t.estimatedTime)
        : acc,
    0,
  );
  const totalSaved = tasks.reduce(
    (acc, t) =>
      t.status === "COMPLETED" && t.actualTime < t.estimatedTime
        ? acc + (t.estimatedTime - t.actualTime)
        : acc,
    0,
  );
  const executionScore =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 60) : 0;

  const isClosed = log.status === "CLOSED";

  return (
    <div className="space-y-8">
      {/* Client Header Component for Edit/Delete */}
      <LogHeader log={log} isClosed={isClosed} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPIGrid
          total={totalTasks}
          completed={completedCount}
          est={totalEst}
          act={totalAct}
          score={executionScore}
          overrun={overrunTime}
          saved={totalSaved}
        />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <TaskTable
          tasks={tasks}
          projects={projects}
          dailyLogId={log.id}
          isReadOnly={isClosed}
        />
      </div>
    </div>
  );
}
