import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-zinc-100">
      <div className="flex max-w-md flex-col items-center text-center space-y-4 p-8 bg-zinc-900/50 border border-zinc-800 rounded-xl">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h1 className="text-2xl font-bold">Authentication Failed</h1>
        <p className="text-zinc-400 text-sm">
          We couldn&apos;t verify your secure login session. This usually
          happens if the request took too long, your network dropped, or the
          login code expired.
        </p>
        <Button
          asChild
          className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white w-full"
        >
          <Link href="/">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
