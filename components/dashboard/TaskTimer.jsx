"use client";

import { useState, useEffect } from "react";
import { startTaskTimer, pauseTaskTimer } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TaskTimer({ task }) {
  const [seconds, setSeconds] = useState(task.elapsedSeconds);
  const [isRunning, setIsRunning] = useState(task.isRunning);

  // Sync with DB updates
  useEffect(() => {
    setSeconds(task.elapsedSeconds);
    setIsRunning(task.isRunning);
  }, [task.elapsedSeconds, task.isRunning]);

  // Ticker Effect
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      // If just started, we need to add the time since lastStartTime locally
      // to avoid the "jump" when revalidating.
      // For simplicity, we just tick up from the known state.
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleToggle = async (e) => {
    e.stopPropagation(); // Prevent row click
    if (isRunning) {
      setIsRunning(false); // Optimistic UI
      await pauseTaskTimer(task.id);
    } else {
      setIsRunning(true);
      await startTaskTimer(task.id);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Time Display */}
      <div
        className={cn(
          "font-mono font-medium min-w-[60px] text-right transition-colors",
          isRunning ? "text-amber-400" : "text-zinc-500",
        )}
      >
        {formatTime(seconds)}
      </div>

      {/* Control Button */}
      <Button
        size="sm"
        variant={isRunning ? "secondary" : "secondary"}
        onClick={handleToggle}
        className={cn(
          "h-8 w-8 p-0 border transition-all",
          isRunning
            ? "bg-amber-500/10 border-amber-500/50 text-amber-500 hover:bg-amber-500/20"
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/50",
        )}
      >
        {isRunning ? (
          <Pause className="w-3.5 h-3.5 fill-current" />
        ) : (
          <Play className="w-3.5 h-3.5 fill-current" />
        )}
      </Button>
    </div>
  );
}
