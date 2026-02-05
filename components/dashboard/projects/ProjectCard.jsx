"use client";

import { toggleProjectStatus, deleteProject } from "@/app/dashboard/actions";
import ProjectDialog from "./ProjectDialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  CheckCircle2,
  MoreVertical,
  Briefcase,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export default function ProjectCard({ project }) {
  const isCompleted = project.status === "COMPLETED";
  const isExpense = project.type === "SPENDING";

  // 1. Time Logic
  const totalMinutesSpent = project.tasks.reduce(
    (acc, t) => acc + (t.actualTime || 0),
    0,
  );
  const hoursSpent = Math.round((totalMinutesSpent / 60) * 10) / 10;

  // 2. Financial Logic
  let financialLabel = "$0.00";
  let subLabel = "Cost";

  // Calculate total spent from TASKS (The real actuals)
  const totalActualSpent = project.tasks.reduce(
    (acc, t) => acc + (t.actualCost || 0),
    0,
  );

  if (project.pricingType === "FIXED") {
    if (isExpense) {
      // Show Remaining Budget
      const budget = project.fixedBudget || 0;
      const remaining = budget - totalActualSpent;
      financialLabel = `$${remaining.toFixed(2)}`;
      subLabel = `Remaining of $${budget}`;
    } else {
      financialLabel = `$${project.fixedBudget?.toLocaleString()}`;
      subLabel = "Fixed Revenue";
    }
  } else if (
    project.pricingType === "PER_TASK" ||
    project.pricingType === "HOURLY"
  ) {
    // For variable costs, just show total accumulated spend
    financialLabel = `$${totalActualSpent.toFixed(2)}`;
    subLabel = "Total Spent";
  }

  // 3. Progress Logic
  const estimatedHours = project.estimatedHours || 0;
  const progressPercent =
    estimatedHours > 0 ? Math.min(100, (hoursSpent / estimatedHours) * 100) : 0;

  // 4. Deadline Logic
  let daysLeftLabel = "No Deadline";
  let deadlineColor = "text-zinc-500";
  if (project.endDate) {
    const today = new Date();
    const diffDays = Math.ceil(
      (new Date(project.endDate) - today) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      daysLeftLabel = `${Math.abs(diffDays)}d overdue`;
      deadlineColor = "text-red-500";
    } else {
      daysLeftLabel = `${diffDays}d left`;
      deadlineColor = diffDays <= 3 ? "text-orange-500" : "text-emerald-500";
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-xl border bg-zinc-900/40 p-5 transition-all hover:border-zinc-700",
        isCompleted ? "opacity-75" : "",
        isExpense
          ? "border-l-2 border-l-red-500"
          : "border-l-2 border-l-emerald-500",
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3
            className={cn(
              "font-bold text-lg text-zinc-100",
              isCompleted && "line-through text-zinc-500",
            )}
          >
            {project.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
            {isExpense ? (
              <TrendingDown className="w-3 h-3 text-red-400" />
            ) : (
              <Briefcase className="w-3 h-3" />
            )}
            {project.clientName ||
              (isExpense ? "Internal Expense" : "Client Work")}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-zinc-500 hover:text-white"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-zinc-950 border-zinc-800 text-zinc-300"
          >
            <DropdownMenuItem
              onClick={() =>
                toggleProjectStatus(
                  project.id,
                  isCompleted ? "ACTIVE" : "COMPLETED",
                )
              }
            >
              {isCompleted ? "Mark Active" : "Mark Completed"}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-400 focus:text-red-400"
              onClick={() => deleteProject(project.id)}
            >
              Delete Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress Section */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Progress ({Math.round(progressPercent)}%)</span>
          <span
            className={
              hoursSpent > estimatedHours ? "text-red-400" : "text-zinc-400"
            }
          >
            {hoursSpent} / {estimatedHours} hrs
          </span>
        </div>
        <Progress
          value={progressPercent}
          className={cn(
            "h-2",
            hoursSpent > estimatedHours ? "bg-red-900" : "bg-zinc-800",
          )}
        />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> {isExpense ? "Spent" : "Revenue"}
          </div>
          <div
            className={cn(
              "font-mono font-medium",
              isExpense ? "text-red-300" : "text-emerald-300",
            )}
          >
            {financialLabel}
          </div>
          <div className="text-[10px] text-zinc-600">{subLabel}</div>
        </div>

        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Time Left
          </div>
          <div className={cn("font-mono font-medium", deadlineColor)}>
            {daysLeftLabel}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-4">
        <Badge
          variant="secondary"
          className={cn(
            "text-[10px]",
            isCompleted
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-zinc-800 text-zinc-400",
          )}
        >
          {isCompleted ? "COMPLETED" : "ACTIVE"}
        </Badge>
        <div className="flex gap-2">
          <ProjectDialog project={project} />
        </div>
      </div>
    </div>
  );
}
