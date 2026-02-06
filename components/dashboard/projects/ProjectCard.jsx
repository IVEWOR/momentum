"use client";

import { toggleProjectStatus, deleteProject } from "@/app/dashboard/actions";
import ProjectDialog from "./ProjectDialog";
import PaymentManager from "./PaymentManager";
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
  CalendarDays,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  differenceInMonths,
} from "date-fns";

export default function ProjectCard({ project }) {
  const isCompleted = project.status === "COMPLETED";
  const isExpense = project.type === "SPENDING";
  const isMonthly = project.pricingType === "MONTHLY";
  const currencySymbol = project.currency === "INR" ? "₹" : "$";

  // ---------------------------------------------------------------------------
  // 1. TIME & PROGRESS LOGIC
  // ---------------------------------------------------------------------------

  let relevantTasks = project.tasks;
  let timeLabel = "Total Time";

  // If Monthly, filter tasks to ONLY show this month's work in the progress bar
  if (isMonthly) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    relevantTasks = project.tasks.filter((t) =>
      isWithinInterval(new Date(t.workDate), {
        start: monthStart,
        end: monthEnd,
      }),
    );
    timeLabel = "This Month";
  }

  const minutesSpent = relevantTasks.reduce(
    (acc, t) => acc + (t.actualTime || 0),
    0,
  );
  const hoursSpent = Math.round((minutesSpent / 60) * 10) / 10;
  const estimatedHours = project.estimatedHours || 0;

  // Progress Calculation
  const progressPercent =
    estimatedHours > 0 ? Math.min(100, (hoursSpent / estimatedHours) * 100) : 0;

  // ---------------------------------------------------------------------------
  // 2. FINANCIAL DISPLAY LOGIC
  // ---------------------------------------------------------------------------

  // Calculate Actual Paid from Manual Payment Ledger
  const totalPaid = project.payments.reduce((acc, p) => acc + p.amount, 0);

  let financialLabel = `${currencySymbol}0.00`;
  let subLabel = "Recorded";

  if (isMonthly) {
    // Monthly: Show Rate prominently + Total LTV (Total Paid)
    const monthlyRate = project.fixedBudget || 0;

    // Calculate active duration for estimation
    const startDate = project.startDate
      ? new Date(project.startDate)
      : new Date();
    const monthsActive = Math.max(
      1,
      differenceInMonths(new Date(), startDate) + 1,
    );

    financialLabel = `${currencySymbol}${monthlyRate.toLocaleString()} / mo`;
    subLabel = `LTV: ${currencySymbol}${totalPaid.toLocaleString()}`;
  } else {
    // Fixed/Hourly/PerTask: Show what has been PAID/RECORDED vs Target
    financialLabel = `${currencySymbol}${totalPaid.toLocaleString()}`;

    if (project.pricingType === "FIXED") {
      const budget = project.fixedBudget || 0;
      if (isExpense) {
        // Expenses: Show remaining budget
        const remaining = budget - totalPaid;
        subLabel = `Remaining: ${currencySymbol}${remaining.toLocaleString()}`;
      } else {
        // Income: Show total value
        subLabel = `of ${currencySymbol}${budget.toLocaleString()}`;
      }
    } else {
      subLabel = "Total Recorded";
    }
  }

  // ---------------------------------------------------------------------------
  // 3. DEADLINE LOGIC
  // ---------------------------------------------------------------------------

  let daysLeftLabel = "No Deadline";
  let deadlineColor = "text-zinc-500";

  if (isMonthly) {
    daysLeftLabel = "Recurring";
    deadlineColor = "text-blue-400";
  } else if (project.endDate) {
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

  // ---------------------------------------------------------------------------
  // 4. RENDER
  // ---------------------------------------------------------------------------

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
      {/* HEADER */}
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
            {isMonthly ? (
              <CalendarDays className="w-3 h-3 text-blue-400" />
            ) : isExpense ? (
              <TrendingDown className="w-3 h-3 text-red-400" />
            ) : (
              <Briefcase className="w-3 h-3" />
            )}
            {project.clientName || (isExpense ? "Internal Expense" : "Client")}
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

      {/* PROGRESS BAR */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>
            {timeLabel} ({Math.round(progressPercent)}%)
          </span>
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

      {/* DETAILS GRID */}
      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        {/* Financials */}
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <DollarSign className="w-3 h-3" />{" "}
            {isExpense ? "Paid Out" : "Revenue"}
          </div>
          <div
            className={cn(
              "font-mono font-medium truncate",
              isExpense ? "text-red-300" : "text-emerald-300",
            )}
          >
            {financialLabel}
          </div>
          <div className="text-[10px] text-zinc-600 truncate">{subLabel}</div>
        </div>

        {/* Timeline */}
        <div className="space-y-1">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Timeline
          </div>
          <div className={cn("font-mono font-medium", deadlineColor)}>
            {daysLeftLabel}
          </div>
        </div>
      </div>

      {/* FOOTER ACTIONS */}
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
          {isMonthly ? "SUBSCRIPTION" : isCompleted ? "COMPLETED" : "ACTIVE"}
        </Badge>

        <div className="flex gap-2">
          {/* Wallet Button for Payments */}
          <PaymentManager project={project} />

          {/* Edit Project Button */}
          <ProjectDialog project={project} />

          {/* Quick Complete Button (Only for Active non-Monthly) */}
          {!isCompleted && !isMonthly && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-emerald-500 hover:bg-emerald-500/10"
              onClick={() => toggleProjectStatus(project.id, "COMPLETED")}
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
