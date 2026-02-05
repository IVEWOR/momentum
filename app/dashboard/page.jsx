import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { createNewLog } from "@/app/dashboard/actions";
import { Plus } from "lucide-react";
import LogCard from "@/components/dashboard/LogCard";
import { SubmitButton } from "@/components/ui/submit-button"; // Import new button

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch Logs - Sorted by LAST UPDATED first
  const logs = await prisma.dailyLog.findMany({
    where: { userId: user.id },
    include: { tasks: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Execution Logs</h2>
          <p className="text-zinc-400">Your history of work sessions.</p>
        </div>

        <form action={createNewLog}>
          <SubmitButton className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" /> Start New Day
          </SubmitButton>
        </form>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {logs.length > 0 ? (
          logs.map((log) => <LogCard key={log.id} log={log} />)
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
            No logs found. Start a new day to begin tracking.
          </div>
        )}
      </div>
    </div>
  );
}
