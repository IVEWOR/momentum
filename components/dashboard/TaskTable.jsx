"use client";

import { startTask, deleteTask } from "@/app/dashboard/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTaskDialog from "./CreateTaskDialog";
import StopTaskDialog from "./StopTaskDialog";
import NotesEditor from "./NotesEditor";

export default function TaskTable({ tasks }) {
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
      <div className="flex justify-end mb-4">
        <CreateTaskDialog />
      </div>

      <div className="rounded-md border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800">
            <tr>
              <th className="py-3 px-4 w-[50px]">State</th>
              <th className="py-3 px-4 w-[30%]">Task</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Est.</th>
              <th className="py-3 px-4 text-right">Act.</th>
              <th className="py-3 px-4 text-center">Notes</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500">
                  No tasks for today. Start by adding one.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const isRunning = task.startTime && !task.endTime;

                return (
                  <tr
                    key={task.id}
                    className="group hover:bg-zinc-900/40 transition-colors"
                  >
                    {/* Status Icon */}
                    <td className="p-4">
                      {task.status ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full border-2",
                            isRunning
                              ? "border-amber-500 animate-pulse"
                              : "border-zinc-700",
                          )}
                        />
                      )}
                    </td>

                    {/* Description */}
                    <td className="p-4">
                      <div
                        className={cn(
                          "font-medium",
                          task.status && "line-through text-zinc-500",
                        )}
                      >
                        {task.description}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {task.category}
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

                    {/* Actual Time */}
                    <td
                      className={cn(
                        "p-4 text-right font-mono font-bold",
                        task.actualTime > task.estimatedTime
                          ? "text-red-400"
                          : "text-emerald-400",
                      )}
                    >
                      {task.actualTime || "-"}
                    </td>

                    {/* Notes Editor */}
                    <td className="p-4 text-center">
                      <NotesEditor task={task} />
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!task.status && (
                          <>
                            {isRunning ? (
                              <StopTaskDialog task={task} />
                            ) : (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => startTask(task.id)}
                                className="h-8 w-8 p-0 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              >
                                <Play className="w-3.5 h-3.5 fill-current" />
                              </Button>
                            )}
                          </>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
