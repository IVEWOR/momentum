"use client";

import { useState } from "react";
import {
  toggleTaskTimer,
  deleteTask,
  updateNotes,
} from "@/app/dashboard/actions"; // We will create updateNotes
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Play, Square, CheckCircle2, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import CreateTaskDialog from "./CreateTaskDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
              <th className="py-3 px-4 w-[50px]">Status</th>
              <th className="py-3 px-4 w-[30%]">Task</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4 text-right">Est.</th>
              <th className="py-3 px-4 text-right">Act.</th>
              <th className="py-3 px-4 text-center">Notes</th>{" "}
              {/* NEW COLUMN */}
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {tasks.map((task) => {
              const isRunning = task.startTime && !task.endTime;

              return (
                <tr key={task.id} className="group hover:bg-zinc-900/40">
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

                  <td className="p-4">
                    <div
                      className={cn(
                        "font-medium",
                        task.status && "line-through text-zinc-500",
                      )}
                    >
                      {task.description}
                    </div>
                    <div className="text-xs text-zinc-500">{task.category}</div>
                  </td>

                  <td className="p-4">
                    <Badge
                      variant="outline"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                  </td>

                  <td className="p-4 text-right text-zinc-400 font-mono">
                    {task.estimatedTime}m
                  </td>
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

                  {/* NOTES COLUMN WITH POPUP EDITOR */}
                  <td className="p-4 text-center">
                    <NotesEditor task={task} />
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!task.status && (
                        <Button
                          size="sm"
                          variant={isRunning ? "destructive" : "secondary"}
                          onClick={() => toggleTaskTimer(task.id)}
                          className="h-8 w-8 p-0"
                        >
                          {isRunning ? (
                            <Square className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTask(task.id)}
                        className="h-8 w-8 p-0 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sub-component for editing notes
function NotesEditor({ task }) {
  const [notes, setNotes] = useState(task.notes || "");
  const [open, setOpen] = useState(false);

  const handleSave = async () => {
    await updateNotes(task.id, notes);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 p-0",
            task.notes ? "text-blue-400" : "text-zinc-600",
          )}
        >
          <FileText className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Notes for: {task.description}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Log details about bugs, blockers, or process..."
          className="min-h-[150px] bg-zinc-900 border-zinc-800 text-zinc-100"
        />
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Notes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
