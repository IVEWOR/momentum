"use client";

import { useState, useEffect } from "react";
import { completeTask } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { differenceInMinutes } from "date-fns";
import { Check, XCircle, DollarSign, Loader2 } from "lucide-react";

export default function StopTaskDialog({ task }) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState(task.notes || "");
  const [calculatedTime, setCalculatedTime] = useState(0);
  const [actualCost, setActualCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state

  const isSpendingProject = task.project?.type === "SPENDING";

  useEffect(() => {
    if (open && task.startTime) {
      const diff = differenceInMinutes(new Date(), new Date(task.startTime));
      setCalculatedTime(Math.max(1, diff));
    }
  }, [open, task.startTime]);

  const handleComplete = async () => {
    setIsSubmitting(true);
    await completeTask(task.id, {
      actualTime: calculatedTime,
      notes: notes,
      status: "COMPLETED",
      actualCost: isSpendingProject ? actualCost : 0,
    });
    setIsSubmitting(false);
    setOpen(false);
  };

  const handleDrop = async () => {
    setIsSubmitting(true);
    await completeTask(task.id, {
      actualTime: calculatedTime,
      notes: `[DROPPED] ${notes}`,
      status: "DROPPED",
      actualCost: isSpendingProject ? actualCost : 0,
    });
    setIsSubmitting(false);
    setOpen(false);
  };

  return (
    <>
      <Button
        size="sm"
        className="h-8 w-8 p-0 bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 border border-emerald-600/20"
        onClick={() => setOpen(true)}
        title="Finish Task"
      >
        <Check className="w-4 h-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Task</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-500 text-xs">Time Spent</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={calculatedTime}
                    onChange={(e) =>
                      setCalculatedTime(parseInt(e.target.value) || 0)
                    }
                    className="bg-zinc-900 border-zinc-700 font-mono text-lg h-10 text-emerald-400"
                  />
                  <span className="text-zinc-500 text-sm">min</span>
                </div>
              </div>

              {isSpendingProject && (
                <div className="space-y-2">
                  <Label className="text-red-400 text-xs flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Actual Cost ($)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={actualCost}
                    placeholder="0.00"
                    onChange={(e) => setActualCost(e.target.value)}
                    className="bg-red-950/20 border-red-900/50 font-mono text-lg h-10 text-red-400 focus:border-red-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Notes / Outcome</Label>
              <Textarea
                placeholder={
                  isSpendingProject
                    ? "e.g. Bid placed, used 4 connects..."
                    : "Details..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleDrop}
              disabled={isSubmitting}
              className="border-red-900/50 text-red-400 hover:bg-red-950 hover:text-red-300 mr-auto"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Failed/Dropped
            </Button>

            <Button
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Complete Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
