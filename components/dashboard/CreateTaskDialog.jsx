"use client";

import { useState } from "react";
import { createTask } from "@/app/dashboard/actions";
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
import { Plus } from "lucide-react";

export default function CreateTaskDialog() {
  const [open, setOpen] = useState(false);

  async function clientAction(formData) {
    await createTask(formData);
    setOpen(false); // Close modal on success
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>
        <form action={clientAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description" className="text-zinc-400">
              Description
            </Label>
            <Input
              id="description"
              name="description"
              placeholder="e.g. Implement Auth"
              className="bg-zinc-900 border-zinc-800"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category" className="text-zinc-400">
                Category
              </Label>
              <Input
                id="category"
                name="category"
                placeholder="Dev"
                className="bg-zinc-900 border-zinc-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="estimatedTime" className="text-zinc-400">
                Est. Time (min)
              </Label>
              <Input
                id="estimatedTime"
                name="estimatedTime"
                type="number"
                defaultValue="30"
                className="bg-zinc-900 border-zinc-800"
                required
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-zinc-400">Priority</Label>
            <Select name="priority" defaultValue="MEDIUM">
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 w-full"
            >
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
