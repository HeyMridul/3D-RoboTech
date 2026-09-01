"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Shared chrome                                                               */
/* -------------------------------------------------------------------------- */

const controlClasses =
  "w-full bg-charcoal border border-card-border px-3 py-2 text-sm text-foreground placeholder:text-muted/60 transition-colors focus:border-cyan focus:outline-none disabled:opacity-50";

export function FieldShell({
  id,
  label,
  required,
  help,
  errors,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  help?: string;
  errors?: string[];
  children: React.ReactNode;
}) {
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;
  return (
    <div>
      <label
        htmlFor={id}
        className="block font-mono-label text-[10px] text-muted mb-2"
      >
        {label}
        {required && (
          <span className="text-cyan ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {help && !errors?.length && (
        <p id={helpId} className="mt-1.5 text-[11px] text-muted">
          {help}
        </p>
      )}
      {errors?.length ? (
        <p id={errorId} role="alert" className="mt-1.5 text-[11px] text-red">
          {errors.join(". ")}
        </p>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Text-like inputs                                                            */
/* -------------------------------------------------------------------------- */

interface BaseProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
}

export function TextInput({ invalid, onChange, ...props }: BaseProps) {
  return (
    <input
      type="text"
      className={cn(controlClasses, invalid && "border-red")}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function NumberInput({ invalid, onChange, ...props }: BaseProps) {
  return (
    <input
      type="number"
      className={cn(controlClasses, invalid && "border-red")}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function DateInput({ invalid, onChange, ...props }: BaseProps) {
  return (
    <input
      type="date"
      className={cn(controlClasses, invalid && "border-red")}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function TextArea({
  rows = 3,
  invalid,
  onChange,
  ...props
}: BaseProps & { rows?: number }) {
  return (
    <textarea
      rows={rows}
      className={cn(controlClasses, "resize-y", invalid && "border-red")}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  );
}

export function Select({
  options,
  invalid,
  onChange,
  ...props
}: Omit<BaseProps, "placeholder"> & {
  options: { value: string; label: string }[];
}) {
  return (
    <select
      className={cn(controlClasses, invalid && "border-red")}
      aria-invalid={invalid || undefined}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    >
      <option value="">— none —</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  id,
  name,
  checked,
  onChange,
  label,
}: {
  id: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-3 cursor-pointer select-none py-2"
    >
      <input
        id={id}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 accent-cyan"
      />
      <span className="font-mono-label text-[10px] text-muted">{label}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Composite inputs                                                            */
/* -------------------------------------------------------------------------- */

/** Free-form string list. Enter or comma commits the current entry. */
export function TagsInput({
  id,
  values,
  onChange,
  placeholder,
}: {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const next = draft.trim().replace(/,$/, "");
    if (next && !values.includes(next)) onChange([...values, next]);
    setDraft("");
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2" role="list">
        {values.map((v) => (
          <span
            key={v}
            role="listitem"
            className="inline-flex items-center gap-2 font-mono-label text-[10px] px-2 py-1 border border-card-border bg-charcoal text-metallic"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-muted hover:text-red"
              aria-label={`Remove ${v}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        id={id}
        type="text"
        value={draft}
        placeholder={placeholder ?? "Type and press Enter"}
        className={controlClasses}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            commit();
          } else if (e.key === "Backspace" && !draft && values.length) {
            onChange(values.slice(0, -1));
          }
        }}
        onBlur={commit}
      />
    </div>
  );
}

/** Checkbox group for many-to-many relations. */
export function MultiSelect({
  id,
  options,
  values,
  onChange,
}: {
  id: string;
  options: { value: string; label: string }[];
  values: string[];
  onChange: (values: string[]) => void;
}) {
  if (options.length === 0) {
    return (
      <p className="text-[11px] text-muted border border-dashed border-card-border p-3">
        Nothing to choose from yet.
      </p>
    );
  }

  return (
    <div
      id={id}
      role="group"
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 max-h-56 overflow-y-auto border border-card-border bg-charcoal p-3"
    >
      {options.map((o) => {
        const checked = values.includes(o.value);
        return (
          <label
            key={o.value}
            className="flex items-center gap-2 text-[12px] text-metallic cursor-pointer py-1"
          >
            <input
              type="checkbox"
              checked={checked}
              className="w-3.5 h-3.5 accent-cyan"
              onChange={() =>
                onChange(
                  checked
                    ? values.filter((v) => v !== o.value)
                    : [...values, o.value],
                )
              }
            />
            {o.label}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Uploads through /api/admin/upload and stores the returned URL. Accepts a
 * pasted URL too, so externally hosted assets still work.
 */
export function FileField({
  id,
  value,
  onChange,
  accept,
  preview,
}: {
  id: string;
  value: string;
  onChange: (url: string) => void;
  accept: string;
  preview?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed.");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={value}
          placeholder="/uploads/… or a full URL"
          className={controlClasses}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="shrink-0 font-mono-label text-[10px] px-3 border border-cyan/40 text-cyan hover:bg-cyan/10 disabled:opacity-50"
        >
          {busy ? "UPLOADING…" : "UPLOAD"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
      {error && (
        <p role="alert" className="text-[11px] text-red">
          {error}
        </p>
      )}
      {preview && value ? (
        // Admin previews arbitrary operator-supplied URLs, which next/image
        // would need host allow-listing for.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-24 w-auto border border-card-border object-cover"
        />
      ) : null}
    </div>
  );
}

export function useFieldId(name: string) {
  const base = useId();
  return `${base}-${name}`;
}
