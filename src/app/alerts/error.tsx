"use client";

import { Button } from "@/components/ui/button";

export default function AlertsErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="py-8 px-6 flex flex-col items-center gap-4">
      <h2 className="text-center">Something went wrong!</h2>
      <p className="text-sm text-muted-foreground text-center">
        Could not load alerts page. Error: {error.message}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
