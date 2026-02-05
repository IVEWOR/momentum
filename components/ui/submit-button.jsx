"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  className,
  variant = "default",
  size = "default",
  ...props
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      size={size}
      className={cn("relative", className)}
      {...props}
    >
      {pending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />
      )}
      {children}
    </Button>
  );
}
