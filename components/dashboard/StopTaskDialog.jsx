"use client";

import { useState, useEffect } from "react";
import { stopTaskWithNotes } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInMinutes } from "date-fns";
import { Square } from "lucide-react";

export default function StopTaskDialog({ task }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const [calculatedTime, setCalculatedTime] = useState(0);

  // Calculate time immediately when dialog opens
  useEffect(() => {
    if (open && task.startTime) {
      const diff = differenceInMinutes(new Date(), new Date(task.startTime));
      // Ensure at least 1 minute is logged
      setCalculatedTime(Math.max(1, diff));
    }
  }, [open, task.startTime]);

  const handleStop = async () => {
    await stopTaskWithNotes(task.id, {
      actualTime: calculatedTime,
      notes: notes,
    });
    setOpen(false);
  };

  const isOverrun = calculatedTime > task.estimatedTime;

  return (
    <>
      <Button
        size="sm"
        variant="destructive"
        className="h-8 w-8 p-0 bg-red-500/10 text-red-500 hover:bg-red-500/20"
        onClick={() => setOpen(true)}
      >
        <Square className="w-3.5 h-3.5 fill-current" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Review your session before finishing. Adding notes helps the AI
              analyze your workflow.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Time Review Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-500 text-xs uppercase tracking-wider">
                  Estimated
                </Label>
                <div className="text-2xl font-mono text-zinc-400">
                  {task.estimatedTime}m
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-500 text-xs uppercase tracking-wider">
                  Actual Time
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calculatedTime}
                    onChange={(e) =>
                      setCalculatedTime(parseInt(e.target.value) || 0)
                    }
                    className={`bg-zinc-900 border-zinc-700 font-mono text-lg h-10 ${isOverrun ? "text-red-400 border-red-900/50" : "text-emerald-400"}`}
                  />
                  <span className="text-zinc-500 text-sm">min</span>
                </div>
              </div>
            </div>

            {isOverrun && (
              <div className="p-3 rounded bg-red-950/20 border border-red-900/30 text-red-400 text-sm">
                ⚠️ You exceeded the estimate by{" "}
                <strong>{calculatedTime - task.estimatedTime} minutes</strong>.
              </div>
            )}

            {/* Notes Section */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-zinc-300">
                Session Notes & Feedback
              </Label>
              <Textarea
                id="notes"
                placeholder="What went wrong? What went well? (e.g. 'Got stuck on API docs for 20 mins')"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStop}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Confirm & Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
