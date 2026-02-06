"use client";

import { useState } from "react";
import { createProject, updateProject } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubmitButton } from "@/components/ui/submit-button";

export default function ProjectDialog({ project = null }) {
  const [open, setOpen] = useState(false);
  const [pricingType, setPricingType] = useState(
    project?.pricingType || "FIXED",
  );
  const [projectType, setProjectType] = useState(project?.type || "EARNING");

  // New Cuirrency state
  const [currency, setCurrency] = useState(project?.currency || "USD");

  const isEdit = !!project;
  const isExpense = projectType === "SPENDING";
  const currencySymbol = currency === "INR" ? "₹" : "$";

  async function clientAction(formData) {
    if (isEdit) {
      formData.append("id", project.id);
      await updateProject(formData);
    } else {
      await createProject(formData);
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white"
          >
            <Pencil className="w-4 h-4" />
          </Button>
        ) : (
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <Plus className="w-4 h-4" /> New Project
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>

        <form action={clientAction} className="grid gap-4 py-4">
          {/* Top Row: Type & Currency */}
          <div className="grid grid-cols-2 gap-4">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-zinc-900 rounded-lg border border-zinc-800 h-10">
              <button
                type="button"
                onClick={() => setProjectType("EARNING")}
                className={cn(
                  "text-xs font-medium rounded transition-all",
                  !isExpense ? "bg-zinc-800 text-emerald-400" : "text-zinc-500",
                )}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setProjectType("SPENDING")}
                className={cn(
                  "text-xs font-medium rounded transition-all",
                  isExpense ? "bg-zinc-800 text-red-400" : "text-zinc-500",
                )}
              >
                Expense
              </button>
              <input type="hidden" name="type" value={projectType} />
            </div>

            {/* Currency Select */}
            <Select
              name="currency"
              defaultValue={currency}
              onValueChange={setCurrency}
            >
              <SelectTrigger className="bg-zinc-900 border-zinc-800 h-10">
                <SelectValue placeholder="Currency" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="INR">INR (₹)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Project Name</Label>
              <Input
                name="name"
                defaultValue={project?.name}
                placeholder={
                  isExpense ? "e.g. Upwork Bidding" : "e.g. Website Redesign"
                }
                className="bg-zinc-900 border-zinc-800"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{isExpense ? "Platform / Context" : "Client Name"}</Label>
              <Input
                name="clientName"
                defaultValue={project?.clientName}
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              name="description"
              defaultValue={project?.description}
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          {/* Financials Section */}
          <div
            className={cn(
              "p-4 rounded-lg border space-y-4",
              isExpense
                ? "bg-red-950/10 border-red-900/30"
                : "bg-emerald-950/10 border-emerald-900/30",
            )}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pricing Model</Label>
                <Select
                  name="pricingType"
                  defaultValue={pricingType}
                  onValueChange={setPricingType}
                >
                  <SelectTrigger className="bg-zinc-900 border-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                    <SelectItem value="FIXED">Fixed Budget</SelectItem>
                    <SelectItem value="HOURLY">Hourly Rate</SelectItem>
                    <SelectItem value="MONTHLY">Monthly Retainer</SelectItem>
                    <SelectItem value="PER_TASK">Per Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {/* Dynamic Labels based on Currency Symbol */}
                {pricingType === "FIXED" && (
                  <>
                    <Label>
                      {isExpense
                        ? `Budget (${currencySymbol})`
                        : `Value (${currencySymbol})`}
                    </Label>
                    <Input
                      name="fixedBudget"
                      type="number"
                      step="0.01"
                      defaultValue={project?.fixedBudget}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </>
                )}
                {pricingType === "HOURLY" && (
                  <>
                    <Label>
                      {isExpense
                        ? `Hourly Cost (${currencySymbol})`
                        : `Hourly Rate (${currencySymbol})`}
                    </Label>
                    <Input
                      name="hourlyRate"
                      type="number"
                      step="0.01"
                      defaultValue={project?.hourlyRate}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </>
                )}
                {pricingType === "MONTHLY" && (
                  <>
                    <Label>
                      {isExpense
                        ? `Monthly Cost (${currencySymbol})`
                        : `Monthly Revenue (${currencySymbol})`}
                    </Label>
                    <Input
                      name="fixedBudget"
                      type="number"
                      step="0.01"
                      defaultValue={project?.fixedBudget}
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </>
                )}
                {pricingType === "PER_TASK" && (
                  <>
                    <Label>
                      {isExpense
                        ? `Cost Per Bid/Item (${currencySymbol})`
                        : `Rate Per Item ((${currencySymbol})`}
                    </Label>
                    <Input
                      name="costPerTask"
                      type="number"
                      step="0.01"
                      defaultValue={project?.costPerTask}
                      placeholder="e.g. 3.10"
                      className="bg-zinc-900 border-zinc-800"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                {pricingType === "MONTHLY"
                  ? "Hours Limit (Per Month)"
                  : "Estimated Hours (Total)"}
              </Label>
              <Input
                name="estimatedHours"
                type="number"
                defaultValue={project?.estimatedHours}
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                name="startDate"
                type="date"
                defaultValue={
                  project?.startDate
                    ? new Date(project.startDate).toISOString().split("T")[0]
                    : ""
                }
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="space-y-2">
              <Label>Deadline</Label>
              <Input
                name="endDate"
                type="date"
                defaultValue={
                  project?.endDate
                    ? new Date(project.endDate).toISOString().split("T")[0]
                    : ""
                }
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
          </div>

          <DialogFooter>
            <SubmitButton
              className={cn(
                "w-full text-white",
                isExpense
                  ? "bg-red-700 hover:bg-red-800"
                  : "bg-emerald-600 hover:bg-emerald-700",
              )}
            >
              {isEdit ? "Update Project" : "Create Project"}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
