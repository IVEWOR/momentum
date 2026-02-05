"use client";

import { useState } from "react";
import { updateNotes } from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function NotesEditor({ task }) {
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
            "h-8 w-8 p-0 hover:bg-zinc-800",
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
          className="min-h-[150px] bg-zinc-900 border-zinc-800 text-zinc-100 focus:ring-emerald-500"
        />
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          Save Notes
        </Button>
      </DialogContent>
    </Dialog>
  );
}
