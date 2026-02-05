"use client";

import { useState } from "react";
import { rolloverTasks } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { ArrowRight, History } from "lucide-react";

export default function RolloverBanner({ overdueTasks }) {
  if (!overdueTasks || overdueTasks.length === 0) return null;

  const handleRollover = async () => {
    const ids = overdueTasks.map((t) => t.id);
    await rolloverTasks(ids);
  };

  return (
    <div className="mb-6 bg-amber-950/30 border border-amber-900/50 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-900/20 rounded-lg">
          <History className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h3 className="text-amber-200 font-medium">Unfinished Business</h3>
          <p className="text-sm text-amber-500/80">
            You have {overdueTasks.length} incomplete tasks from previous days.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* We can add a 'Dismiss' button here later to archive them instead */}
        <Button
          onClick={handleRollover}
          size="sm"
          className="bg-amber-600 hover:bg-amber-700 text-white border-none"
        >
          Move to Today <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
