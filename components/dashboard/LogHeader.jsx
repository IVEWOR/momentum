"use client";

import { useState } from "react";
import {
  updateLogTitle,
  deleteDailyLog,
  closeLog,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Pencil, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function LogHeader({ log, isClosed }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(log.title || "");
  const [isSaving, setIsSaving] = useState(false); // Loading states
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const router = useRouter();

  const handleSave = async () => {
    if (title.trim() !== log.title) {
      setIsSaving(true);
      await updateLogTitle(log.id, title);
      setIsSaving(false);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteDailyLog(log.id);
    router.push("/dashboard");
  };

  const handleClose = async () => {
    setIsClosing(true);
    await closeLog(log.id);
    setIsClosing(false);
  };

  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-800 pb-6 gap-4">
      <div>
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Logs
        </Link>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-900 border-zinc-700 h-9 w-[300px] text-lg font-bold"
                autoFocus
                onBlur={handleSave}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                disabled={isSaving}
              />
              <Button
                size="sm"
                onClick={handleSave}
                variant="ghost"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h1
                className="text-3xl font-bold tracking-tight text-white cursor-pointer"
                onClick={() => !isClosed && setIsEditing(true)}
              >
                {title || new Date(log.date).toLocaleDateString()}
              </h1>
              {!isClosed && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-3 h-3 text-zinc-500" />
                </Button>
              )}
            </div>
          )}

          {isClosed && (
            <span className="px-2 py-1 bg-zinc-800 text-xs rounded text-zinc-400 flex items-center gap-1">
              <Lock className="w-3 h-3" /> Closed
            </span>
          )}
        </div>
        <p className="text-zinc-400 mt-1 text-sm">
          Created: {new Date(log.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {!isClosed && (
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isClosing}
            className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 min-w-[100px]"
          >
            {isClosing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Close Log"
            )}
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this Daily Log?</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                This action cannot be undone. All tasks inside this log will be
                permanently deleted.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent border-zinc-800 hover:bg-zinc-900 text-zinc-300">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Log
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </header>
  );
}
