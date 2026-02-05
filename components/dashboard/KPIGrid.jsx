import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Timer, AlertTriangle } from "lucide-react";

export default function KPIGrid({
  total,
  completed,
  est,
  act,
  score,
  overrun,
  saved,
}) {
  const metrics = [
    {
      title: "Tasks Today",
      value: `${completed}/${total}`,
      desc: `${Math.round((completed / total || 0) * 100)}% Completion`,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      title: "Execution Score",
      value: score,
      desc: "Daily Performance",
      icon: Activity,
      color:
        score > 80
          ? "text-emerald-500"
          : score > 50
            ? "text-orange-500"
            : "text-red-500",
    },
    // LOGIC CHANGE: Show Overrun if high, otherwise show Saved
    {
      title: overrun > saved ? "Time Lost (Overrun)" : "Time Saved",
      value: overrun > saved ? `${overrun}m` : `${saved}m`,
      desc:
        overrun > saved ? "Inefficiency detected" : "Better than estimation",
      icon: overrun > saved ? AlertTriangle : Timer,
      color: overrun > saved ? "text-red-500" : "text-emerald-500",
    },
    {
      title: "Total Actual",
      value: `${act}m`,
      desc: `Total Est: ${est}m`,
      icon: Timer,
      color: "text-blue-500",
    },
  ];

  return (
    <>
      {metrics.map((m, i) => (
        <Card key={i} className="bg-zinc-900/50 border-zinc-800 text-zinc-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              {m.title}
            </CardTitle>
            <m.icon className={`h-4 w-4 ${m.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{m.value}</div>
            <p className={`text-xs ${m.color} brightness-75 mt-1`}>{m.desc}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
