"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const handleLogin = async () => {
    const supabase = createClient();

    // Using the current window location as the redirect base
    const redirectTo = `${window.location.origin}/auth/callback`;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-6">MOMENTUM</h1>
      <p className="text-zinc-400 mb-8">
        Execution analytics for high performers.
      </p>

      <Button
        onClick={handleLogin}
        className="bg-white text-black hover:bg-zinc-200"
      >
        Login with Google
      </Button>
    </div>
  );
}
