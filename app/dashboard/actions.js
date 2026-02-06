"use server";

import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { differenceInSeconds } from "date-fns";
import { redirect } from "next/navigation";

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

// -----------------------------------------------------------------------------
// PAYMENT ACTIONS
// -----------------------------------------------------------------------------

export async function addProjectPayment(formData) {
  const user = await getUser();
  const projectId = formData.get("projectId");

  await prisma.payment.create({
    data: {
      projectId: projectId,
      amount: parseFloat(formData.get("amount")),
      date: new Date(formData.get("date")),
      notes: formData.get("notes"),
    },
  });

  revalidatePath("/dashboard/projects");
}

export async function deletePayment(paymentId) {
  const user = await getUser();
  // Ensure the project belongs to user before deleting payment
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { project: true },
  });

  if (payment && payment.project.userId === user.id) {
    await prisma.payment.delete({ where: { id: paymentId } });
    revalidatePath("/dashboard/projects");
  }
}

// -----------------------------------------------------------------------------
// DAILY LOG ACTIONS
// -----------------------------------------------------------------------------

export async function createNewLog() {
  const user = await getUser();
  const now = new Date();

  // Generate Default Title: "Log - Feb 5, 10:30 AM"
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateString = now.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const defaultTitle = `Log - ${dateString}, ${timeString}`;

  const newLog = await prisma.dailyLog.create({
    data: {
      userId: user.id,
      date: now,
      title: defaultTitle,
      status: "OPEN",
    },
  });

  redirect(`/dashboard/log/${newLog.id}`);
}

export async function updateLogTitle(logId, newTitle) {
  const user = await getUser();
  await prisma.dailyLog.update({
    where: { id: logId, userId: user.id },
    data: { title: newTitle },
  });
  revalidatePath(`/dashboard/log/${logId}`);
  revalidatePath("/dashboard");
}

export async function deleteDailyLog(logId) {
  const user = await getUser();
  await prisma.dailyLog.delete({
    where: { id: logId, userId: user.id },
  });
  revalidatePath("/dashboard");
  // If called from the log page itself, the client should handle redirect
}

export async function closeLog(logId) {
  const user = await getUser();
  await prisma.dailyLog.update({
    where: { id: logId, userId: user.id },
    data: { status: "CLOSED" },
  });
  revalidatePath(`/dashboard/log/${logId}`);
  revalidatePath("/dashboard");
}

// -----------------------------------------------------------------------------
// UPDATED PROJECT ACTIONS (With Currency)
// -----------------------------------------------------------------------------

export async function createProject(formData) {
  const user = await getUser();

  await prisma.project.create({
    data: {
      userId: user.id,
      name: formData.get("name"),
      clientName: formData.get("clientName"),
      description: formData.get("description"),
      type: formData.get("type"),

      // NEW: Currency
      currency: formData.get("currency"), // 'USD' or 'INR'

      pricingType: formData.get("pricingType"),
      hourlyRate: parseFloat(formData.get("hourlyRate") || 0),
      fixedBudget: parseFloat(formData.get("fixedBudget") || 0),
      costPerTask: parseFloat(formData.get("costPerTask") || 0),
      estimatedHours: parseInt(formData.get("estimatedHours") || 0),
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate"))
        : new Date(),
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate"))
        : null,
      status: "ACTIVE",
    },
  });
  revalidatePath("/dashboard/projects");
}

export async function updateProject(formData) {
  const user = await getUser();
  const projectId = formData.get("id");

  await prisma.project.update({
    where: { id: projectId, userId: user.id },
    data: {
      name: formData.get("name"),
      clientName: formData.get("clientName"),
      description: formData.get("description"),
      type: formData.get("type"),

      // Update Currency
      currency: formData.get("currency"),

      pricingType: formData.get("pricingType"),
      hourlyRate: parseFloat(formData.get("hourlyRate") || 0),
      fixedBudget: parseFloat(formData.get("fixedBudget") || 0),
      costPerTask: parseFloat(formData.get("costPerTask") || 0),
      estimatedHours: parseInt(formData.get("estimatedHours") || 0),
      startDate: formData.get("startDate")
        ? new Date(formData.get("startDate"))
        : null,
      endDate: formData.get("endDate")
        ? new Date(formData.get("endDate"))
        : null,
    },
  });
  revalidatePath("/dashboard/projects");
}

export async function toggleProjectStatus(projectId, newStatus) {
  const user = await getUser();
  await prisma.project.update({
    where: { id: projectId, userId: user.id },
    data: { status: newStatus },
  });
  revalidatePath("/dashboard/projects");
}

export async function deleteProject(projectId) {
  const user = await getUser();
  await prisma.project.delete({
    where: { id: projectId, userId: user.id },
  });
  revalidatePath("/dashboard/projects");
}

// -----------------------------------------------------------------------------
// TASK ACTIONS
// -----------------------------------------------------------------------------

export async function createTask(formData) {
  const user = await getUser();
  const dailyLogId = formData.get("dailyLogId");
  if (!dailyLogId) throw new Error("Task must be attached to a Daily Log.");

  await prisma.task.create({
    data: {
      userId: user.id,
      dailyLogId: dailyLogId,
      projectId:
        formData.get("projectId") === "none" ? null : formData.get("projectId"),
      description: formData.get("description"),
      priority: formData.get("priority"),
      estimatedTime: parseInt(formData.get("estimatedTime")),
      status: "PENDING",
      category: "General", // Default category
    },
  });
  revalidatePath(`/dashboard/log/${dailyLogId}`);
  // Also revalidate projects in case hours changed
  revalidatePath("/dashboard/projects");
}

export async function startTaskTimer(taskId) {
  const user = await getUser();
  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: user.id },
    select: { dailyLogId: true },
  });
  if (!task) return;

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { isRunning: true, lastStartTime: new Date(), status: "PENDING" },
  });
  if (task.dailyLogId) revalidatePath(`/dashboard/log/${task.dailyLogId}`);
}

export async function pauseTaskTimer(taskId) {
  const user = await getUser();
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || !task.lastStartTime) return;

  const sessionSeconds = differenceInSeconds(new Date(), task.lastStartTime);
  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: {
      isRunning: false,
      lastStartTime: null,
      elapsedSeconds: task.elapsedSeconds + sessionSeconds,
      actualTime: Math.floor((task.elapsedSeconds + sessionSeconds) / 60),
    },
  });
  if (task.dailyLogId) revalidatePath(`/dashboard/log/${task.dailyLogId}`);
  revalidatePath("/dashboard/projects");
}

export async function completeTask(taskId, payload) {
  const user = await getUser();
  const { notes, status, actualCost } = payload; // NEW: actualCost

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return;

  let finalSeconds = task.elapsedSeconds;

  if (task.isRunning && task.lastStartTime) {
    finalSeconds += differenceInSeconds(new Date(), task.lastStartTime);
  }

  await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: {
      isRunning: false,
      lastStartTime: null,
      elapsedSeconds: finalSeconds,
      endTime: new Date(),
      actualTime: Math.max(1, Math.floor(finalSeconds / 60)),
      notes: notes,
      status: status,

      // NEW: Save the cost if provided
      actualCost: actualCost ? parseFloat(actualCost) : 0,
    },
  });

  if (task.dailyLogId) revalidatePath(`/dashboard/log/${task.dailyLogId}`);
  revalidatePath("/dashboard/projects"); // Update project budget math
}

export async function updateNotes(taskId, notes) {
  const user = await getUser();
  const task = await prisma.task.update({
    where: { id: taskId, userId: user.id },
    data: { notes },
  });
  if (task.dailyLogId) revalidatePath(`/dashboard/log/${task.dailyLogId}`);
}

export async function deleteTask(taskId) {
  const user = await getUser();
  const task = await prisma.task.findUnique({
    where: { id: taskId, userId: user.id },
    select: { dailyLogId: true },
  });
  if (task) {
    await prisma.task.delete({ where: { id: taskId, userId: user.id } });
    if (task.dailyLogId) revalidatePath(`/dashboard/log/${task.dailyLogId}`);
    revalidatePath("/dashboard/projects");
  }
}
