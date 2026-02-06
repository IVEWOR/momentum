"use client";

import { useState } from "react";
import { addProjectPayment, deletePayment } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Wallet, Plus, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { format } from "date-fns";

export default function PaymentManager({ project }) {
  const [open, setOpen] = useState(false);
  const currencySymbol = project.currency === "INR" ? "₹" : "$";

  const sortedPayments = [...project.payments].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  const totalPaid = sortedPayments.reduce((acc, p) => acc + p.amount, 0);

  async function handleAdd(formData) {
    await addProjectPayment(formData);
    // Keep dialog open to see the new entry
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-400 hover:text-emerald-400"
        >
          <Wallet className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Payment Ledger: {project.name}</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-lg border border-zinc-800 mb-4">
          <span className="text-zinc-400 text-sm">Total Logged</span>
          <span className="text-2xl font-bold text-emerald-400">
            {currencySymbol}
            {totalPaid.toLocaleString()}
          </span>
        </div>

        {/* Add Payment Form */}
        <form
          action={handleAdd}
          className="grid gap-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/30 mb-6"
        >
          <h4 className="text-xs font-bold text-zinc-500 uppercase">
            Record New Payment
          </h4>
          <input type="hidden" name="projectId" value={project.id} />

          <div className="grid grid-cols-3 gap-3">
            <Input
              name="date"
              type="date"
              required
              className="bg-zinc-950 border-zinc-800"
              defaultValue={new Date().toISOString().split("T")[0]}
            />
            <Input
              name="amount"
              type="number"
              step="0.01"
              placeholder="Amount"
              required
              className="bg-zinc-950 border-zinc-800"
            />
            <Input
              name="notes"
              placeholder="e.g. Jan Retainer"
              className="bg-zinc-950 border-zinc-800"
            />
          </div>
          <SubmitButton
            size="sm"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Record
          </SubmitButton>
        </form>

        {/* History Table */}
        <div className="max-h-[300px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="text-zinc-500 h-8">Date</TableHead>
                <TableHead className="text-zinc-500 h-8">Note</TableHead>
                <TableHead className="text-right text-zinc-500 h-8">
                  Amount
                </TableHead>
                <TableHead className="w-[40px] h-8"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedPayments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-zinc-500 py-8"
                  >
                    No payments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                sortedPayments.map((pay) => (
                  <TableRow
                    key={pay.id}
                    className="border-zinc-800/50 hover:bg-zinc-900/50"
                  >
                    <TableCell className="py-2 text-zinc-300">
                      {format(new Date(pay.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="py-2 text-zinc-400 text-xs">
                      {pay.notes || "-"}
                    </TableCell>
                    <TableCell className="py-2 text-right font-mono text-emerald-400">
                      {currencySymbol}
                      {pay.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <form action={deletePayment.bind(null, pay.id)}>
                        <button className="text-zinc-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
