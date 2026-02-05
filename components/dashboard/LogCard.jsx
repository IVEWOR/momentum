"use client";

import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Lock, Unlock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDailyLog } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LogCard({ log }) {
  const completed = log.tasks.filter((t) => t.status === "COMPLETED").length;
  const total = log.tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const isOpen = log.status === "OPEN";

  // Calculate nice date strings
  const logDate = new Date(log.date);
  const dateStr = logDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Use the custom title if it exists, otherwise fall back to date
  const displayTitle = log.title || dateStr;

  const handleDelete = async (e) => {
    e.preventDefault(); // Stop link navigation
    await deleteDailyLog(log.id);
  };

  return (
    <Link href={`/dashboard/log/${log.id}`}>
      <Card
        className={cn(
          "bg-zinc-900/40 border-zinc-800 transition-all hover:border-zinc-600 group cursor-pointer relative",
          !isOpen && "opacity-60",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Calendar className="w-4 h-4 text-zinc-500 flex-shrink-0" />
            <span
              className="font-medium text-sm text-zinc-300 truncate"
              title={displayTitle}
            >
              {displayTitle}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? (
              <Unlock className="w-3 h-3 text-emerald-500" />
            ) : (
              <Lock className="w-3 h-3 text-zinc-600" />
            )}

            {/* Delete Button Area */}
            <div onClick={(e) => e.preventDefault()}>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-zinc-600 hover:text-red-400 hover:bg-transparent"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Log?</AlertDialogTitle>
                    <AlertDialogDescription className="text-zinc-400">
                      This will permanently delete this log and all {total}{" "}
                      tasks inside it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-4 flex justify-between items-end">
            <div>
              <div className="text-2xl font-bold text-white">
                {completed}/{total}
              </div>
              <div className="text-xs text-zinc-500">Tasks Completed</div>
            </div>
            <Badge
              variant="outline"
              className={
                isOpen
                  ? "border-emerald-500/30 text-emerald-400"
                  : "border-zinc-700 text-zinc-500"
              }
            >
              {log.status}
            </Badge>
          </div>

          <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
