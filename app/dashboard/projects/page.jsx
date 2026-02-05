import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import ProjectDialog from "@/components/dashboard/projects/ProjectDialog";
import ProjectCard from "@/components/dashboard/projects/ProjectCard";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch projects with tasks to calculate actual time spent
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      tasks: {
        select: { actualTime: true }, // Only need time to sum it up
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeProjects = projects.filter((p) => p.status !== "COMPLETED");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Projects</h2>
          <p className="text-zinc-400">
            Manage budgets, deadlines, and tracking.
          </p>
        </div>
        <ProjectDialog /> {/* Create New Button */}
      </div>

      {/* Active Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
          Active Projects
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeProjects.length > 0 ? (
            activeProjects.map((p) => <ProjectCard key={p.id} project={p} />)
          ) : (
            <div className="col-span-full py-10 text-center border border-dashed border-zinc-800 rounded-xl text-zinc-500">
              No active projects. Start one now!
            </div>
          )}
        </div>
      </div>

      {/* Completed Section (Collapsible feeling) */}
      {completedProjects.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-zinc-900">
          <h3 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">
            Completed Archive
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 opacity-80">
            {completedProjects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
