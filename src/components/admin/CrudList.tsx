"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { TechBadge } from "@/components/ui/TechBadge";
import type { ResourceConfig } from "@/config/admin";

interface CrudListProps {
  config: ResourceConfig;
  rows: Record<string, unknown>[];
}

function displayValue(value: unknown) {
  if (value == null) return "—";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return String(value);
}

export function CrudList({ config, rows }: CrudListProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm(`Delete this ${config.singular.toLowerCase()}?`)) return;
    const res = await fetch(`/api/admin/${config.key}/${id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono-label text-cyan mb-1">CMS</p>
          <h1 className="font-display text-2xl font-bold">{config.title}</h1>
        </div>
        <Link
          href={`${config.listHref}/new`}
          className="font-mono-label text-[11px] px-4 py-2 border border-cyan text-cyan hover:bg-cyan/10"
        >
          + NEW {config.singular.toUpperCase()}
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="border border-card-border bg-card p-12 text-center">
          <p className="font-mono-label text-muted">
            NO {config.title.toUpperCase()} FOUND
          </p>
        </div>
      ) : (
        <div className="border border-card-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-graphite font-mono-label text-[10px] text-muted">
              <tr>
                {config.columns.map((col) => (
                  <th key={col.key} className="text-left p-3">
                    {col.label}
                  </th>
                ))}
                <th className="text-left p-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)} className="border-t border-card-border">
                  {config.columns.map((col) => (
                    <td key={col.key} className="p-3">
                      {col.key === "publishStatus" ? (
                        <TechBadge
                          variant={
                            row[col.key] === "PUBLISHED" ? "green" : "default"
                          }
                        >
                          {displayValue(row[col.key])}
                        </TechBadge>
                      ) : (
                        displayValue(row[col.key])
                      )}
                    </td>
                  ))}
                  <td className="p-3 space-x-3">
                    <Link
                      href={`${config.listHref}/${row.id}`}
                      className="text-cyan hover:underline font-mono-label text-[10px]"
                    >
                      EDIT
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(String(row.id))}
                      className="text-red hover:underline font-mono-label text-[10px]"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
