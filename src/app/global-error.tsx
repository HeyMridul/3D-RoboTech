"use client";

import { useEffect } from "react";

/**
 * Replaces the root layout when it is the layout itself that failed, so this
 * cannot rely on any app styling or fonts being available.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TRAIC] root layout error", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070a",
          color: "#e6edf3",
          fontFamily: "ui-monospace, SFMono-Regular, monospace",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div>
          <p style={{ color: "#ef4444", letterSpacing: "0.14em", fontSize: 12 }}>
            CRITICAL FAULT
          </p>
          <h1 style={{ fontSize: "2.5rem", margin: "1rem 0" }}>
            TRAIC SYSTEM OFFLINE
          </h1>
          <p style={{ color: "#78838f", marginBottom: "2rem" }}>
            The application failed to start. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#22d3ee",
              color: "#080b10",
              border: 0,
              padding: "0.85rem 2rem",
              letterSpacing: "0.14em",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            RETRY
          </button>
        </div>
      </body>
    </html>
  );
}
