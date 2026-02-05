"use client";

import { deleteTask } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Trash2, XCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTaskDialog from "./CreateTaskDialog";
import StopTaskDialog from "./StopTaskDialog";
import NotesEditor from "./NotesEditor";
import TaskTimer from "./TaskTimer"; // New Component
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

export default function TaskTable({ tasks, projects, dailyLogId, isReadOnly }) {
  const getPriorityColor = (p) => {
    switch (p) {
      case "HIGH":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "MEDIUM":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "LOW":
        return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      {!isReadOnly && (
        <div className="flex justify-end mb-4">
          <CreateTaskDialog projects={projects} dailyLogId={dailyLogId} />
        </div>
      )}

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4 w-[50px]">Status</th>
              <th className="py-3 px-4 w-[35%]">Task & Project</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Est.</th>
              <th className="py-3 px-4 text-right">Time Log</th>
              <th className="py-3 px-4 text-center">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  No tasks logged for today.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isCompleted = task.status === "COMPLETED";
                const isDropped = task.status === "DROPPED";
                const isPending = task.status === "PENDING";

                // Highlight Row if Running
                const activeClass = task.isRunning
                  ? "bg-amber-950/10 border-l-2 border-l-amber-500"
                  : "hover:bg-zinc-900/40 border-l-2 border-l-transparent";

                return (
                  <tr
                    key={task.id}
                    className={cn(
                      "transition-colors",
                      activeClass,
                      (isCompleted || isDropped) && "opacity-60 bg-zinc-900/20",
                    )}
                  >
                    {/* Status */}
                    <td className="p-4">
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      )}
                      {isDropped && (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {isPending && (
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2",
                            task.isRunning
                              ? "border-amber-500 animate-pulse bg-amber-500/20"
                              : "border-zinc-700",
                          )}
                        />
                      )}
                    </td>

                    {/* Task Details */}
                    <td className="p-4">
                      <div
                        className={cn(
                          "font-medium text-zinc-200",
                          (isCompleted || isDropped) &&
                            "line-through text-zinc-500",
                        )}
                      >
                        {task.description}
                      </div>
                      <div className="flex gap-2 items-center mt-1">
                        {task.project ? (
                          <Badge
                            variant="secondary"
                            className="bg-zinc-800 text-zinc-400 text-[10px] hover:bg-zinc-700"
                          >
                            <Briefcase className="w-3 h-3 mr-1" />{" "}
                            {task.project.name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-600 italic">
                            No Project
                          </span>
                        )}
                        {task.isRunning && (
                          <span className="text-[10px] font-bold text-amber-500 animate-pulse tracking-wide">
                            ● LIVE
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={getPriorityColor(task.priority)}
                      >
                        {task.priority}
                      </Badge>
                    </td>

                    {/* Est Time */}
                    <td className="p-4 text-right text-zinc-400 font-mono">
                      {task.estimatedTime}m
                    </td>

                    {/* NEW: Time Log / Timer Column */}
                    <td className="p-4 text-right">
                      {isPending ? (
                        <TaskTimer task={task} />
                      ) : (
                        // Static Final Time
                        <span
                          className={cn(
                            "font-mono font-bold",
                            task.actualTime > task.estimatedTime
                              ? "text-red-400"
                              : "text-emerald-400",
                          )}
                        >
                          {task.actualTime}m
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="p-4 text-center">
                      <NotesEditor task={task} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {isPending && (
                          // Only show "Finish" button (Checkmark) to open the Stop/Complete Dialog
                          // The Timer/Pause is now handled in the previous column
                          <StopTaskDialog task={task} />
                        )}

                        <ConfirmActionDialog
                          icon={Trash2}
                          title="Delete Task?"
                          desc="This cannot be undone."
                          onConfirm={() => deleteTask(task.id)}
                          confirmText="Delete"
                          isDestructive
                          trigger={
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          }
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Reusable Confirmation Dialog
function ConfirmActionDialog({
  trigger,
  title,
  desc,
  onConfirm,
  confirmText,
  isDestructive,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-zinc-400">
            {desc}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              isDestructive
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
