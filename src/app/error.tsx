"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center section-padding">
      <div className="text-center max-w-md">
        <p className="font-mono-label text-red mb-4">SYSTEM FAULT</p>
        <h1 className="font-display text-5xl font-bold mb-4">SIGNAL ERROR</h1>
        <p className="text-muted mb-8">
          The TRAIC system encountered an unexpected fault. Retry or return to base.
        </p>
        <div className="flex justify-center gap-3">
          <Button type="button" onClick={reset}>
            RETRY
          </Button>
          <Link href="/">
            <Button variant="outline">RETURN TO BASE</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
