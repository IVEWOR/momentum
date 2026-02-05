"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInMinutes } from "date-fns";

// --- Helper: Get Authenticated User ---
async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// --- Action: Create Task ---
export async function createTask(formData) {
  const user = await getUser();

  const description = formData.get("description");
  const priority = formData.get("priority");
  const estimatedTime = parseInt(formData.get("estimatedTime"));
  const category = formData.get("category") || "General";

  // WorkDate defaults to today if not specified
  await prisma.task.create({
    data: {
      userId: user.id,
      description,
      priority,
      estimatedTime,
      category,
      workDate: new Date(),
    },
  });

  revalidatePath("/dashboard");
}

// --- Action: Start Timer Only ---
export async function startTask(taskId) {
  const user = await getUser();
  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { startTime: new Date(), status: false },
  });
  revalidatePath("/dashboard");
}

// --- Action: Stop Task with Review (Notes + Time Override) ---
export async function stopTaskWithNotes(taskId, payload) {
  const user = await getUser();

  // payload contains: { actualTime, notes }
  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: {
      endTime: new Date(),
      actualTime: parseInt(payload.actualTime),
      notes: payload.notes,
      status: true, // Mark as completed
    },
  });
  revalidatePath("/dashboard");
}

// --- Action: Update Notes (Standalone) ---
export async function updateNotes(taskId, notes) {
  const user = await getUser();
  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { notes },
  });
  revalidatePath("/dashboard");
}

// --- Action: Delete Task ---
export async function deleteTask(taskId) {
  const user = await getUser();
  await prisma.task.delete({
    where: { id: taskId, userId: user.id },
  });
  revalidatePath("/dashboard");
}
