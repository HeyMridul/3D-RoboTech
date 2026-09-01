"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TRAIC] unhandled route error", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center section-padding">
      <div className="text-center max-w-lg">
        <p className="font-mono-label text-[11px] text-red mb-4">
          ERROR 500 // SUBSYSTEM FAULT
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
          SYSTEM FAULT
        </h1>
        <p className="text-muted mb-8">
          Something failed while assembling this page. The fault has been
          logged. Retrying often clears a transient error.
        </p>
        {/* The digest is the only safe identifier to surface; the message may
            contain internals. */}
        {error.digest && (
          <p className="font-mono-label text-[10px] text-muted mb-8">
            REF: {error.digest}
          </p>
        )}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button onClick={reset} withArrow={false}>
            RETRY
          </Button>
          <ButtonLink href="/" variant="outline">
            RETURN TO BASE
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
