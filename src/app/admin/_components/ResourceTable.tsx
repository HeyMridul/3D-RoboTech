"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { TechBadge } from "@/components/ui/TechBadge";
import type { ColumnSpec, ResourceUi } from "../_config/resource-ui";

type Row = Record<string, unknown>;

function readPath(row: Row, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object" ? (acc as Row)[key] : undefined,
      row,
    );
}

function Cell({ row, column }: { row: Row; column: ColumnSpec }) {
  const value = readPath(row, column.path ?? column.key);

  if (value === null || value === undefined || value === "") {
    return <span className="text-muted">—</span>;
  }

  switch (column.type) {
    case "status": {
      const status = String(value);
      return (
        <TechBadge variant={status === "PUBLISHED" ? "green" : "default"}>
          {status}
        </TechBadge>
      );
    }
    case "badge":
      return <TechBadge>{String(value)}</TechBadge>;
    case "date":
      return <span>{formatDate(value as string)}</span>;
    case "boolean":
      return value ? (
        <span className="text-green" aria-label="Yes">
          ●
        </span>
      ) : (
        <span className="text-muted" aria-label="No">
          ○
        </span>
      );
    default:
      return <span>{String(value)}</span>;
  }
}

export function ResourceTable({
  resource,
  ui,
  rows,
}: {
  resource: string;
  ui: ResourceUi;
  rows: Row[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      ui.columns.some((column) => {
        const value = readPath(row, column.path ?? column.key);
        return value != null && String(value).toLowerCase().includes(q);
      }),
    );
  }, [rows, query, ui.columns]);

  async function mutate(id: string, init: RequestInit) {
    setBusyId(id);
    setError(null);
    const res = await fetch(`/api/admin/${resource}/${id}`, init);
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Action failed.");
    } else {
      router.refresh();
    }
    setBusyId(null);
  }

  const hasPublishing = ui.columns.some((c) => c.key === "publishStatus");

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <label htmlFor="resource-search" className="sr-only">
          Search {ui.title.toLowerCase()}
        </label>
        <input
          id="resource-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${ui.title.toLowerCase()}…`}
          className="bg-charcoal border border-card-border px-3 py-2 text-sm w-full sm:w-72 focus:border-cyan focus:outline-none"
        />
        <p className="font-mono-label text-[10px] text-muted" aria-live="polite">
          {filtered.length} OF {rows.length}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 border border-red/40 bg-red/5 px-4 py-3 font-mono-label text-[11px] text-red"
        >
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border border-dashed border-card-border p-12 text-center">
          <p className="font-mono-label text-[11px] text-muted mb-2">
            {rows.length === 0
              ? `NO ${ui.title.toUpperCase()} YET`
              : "NO MATCHES"}
          </p>
          <p className="text-sm text-muted">
            {rows.length === 0
              ? `Create the first ${ui.singular.toLowerCase()} to see it here.`
              : "Try a different search term."}
          </p>
        </div>
      ) : (
        <div
          className="border border-card-border overflow-x-auto"
          tabIndex={0}
          role="group"
          aria-label={`${ui.title} table, scrollable`}
        >
          <table className="w-full text-sm">
            <caption className="sr-only">{ui.title}</caption>
            <thead className="bg-graphite font-mono-label text-[10px] text-muted">
              <tr>
                {ui.columns.map((column) => (
                  <th key={column.key} scope="col" className="text-left p-3 font-medium">
                    {column.label}
                  </th>
                ))}
                <th scope="col" className="text-right p-3 font-medium">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const id = String(row.id);
                const busy = busyId === id;
                const published = row.publishStatus === "PUBLISHED";
                return (
                  <tr
                    key={id}
                    className="border-t border-card-border hover:bg-cyan/[0.03]"
                  >
                    {ui.columns.map((column, i) => (
                      <td key={column.key} className="p-3 align-middle">
                        {i === 0 ? (
                          <Link
                            href={`/admin/${resource}/${id}`}
                            className="text-foreground hover:text-cyan font-medium"
                          >
                            <Cell row={row} column={column} />
                          </Link>
                        ) : (
                          <Cell row={row} column={column} />
                        )}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-3 font-mono-label text-[10px]">
                        {hasPublishing && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              mutate(id, {
                                method: "PATCH",
                                headers: { "content-type": "application/json" },
                                body: JSON.stringify({
                                  publishStatus: published ? "DRAFT" : "PUBLISHED",
                                }),
                              })
                            }
                            className="text-muted hover:text-cyan disabled:opacity-40"
                          >
                            {published ? "UNPUBLISH" : "PUBLISH"}
                          </button>
                        )}
                        <Link
                          href={`/admin/${resource}/${id}`}
                          className="text-cyan hover:underline"
                        >
                          EDIT
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => {
                            if (
                              confirm(
                                `Delete this ${ui.singular.toLowerCase()}?`,
                              )
                            ) {
                              mutate(id, { method: "DELETE" });
                            }
                          }}
                          className="text-muted hover:text-red disabled:opacity-40"
                        >
                          DELETE
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
