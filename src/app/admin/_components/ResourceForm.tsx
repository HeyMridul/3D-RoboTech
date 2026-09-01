"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { FieldSpec, ResourceUi } from "../_config/resource-ui";
import {
  Checkbox,
  DateInput,
  FieldShell,
  FileField,
  MultiSelect,
  NumberInput,
  Select,
  TagsInput,
  TextArea,
  TextInput,
} from "./Fields";

export type OptionSets = Record<string, { value: string; label: string }[]>;

type Values = Record<string, unknown>;

interface ResourceFormProps {
  resource: string;
  ui: ResourceUi;
  /** Absent when creating. */
  recordId?: string;
  initialValues: Values;
  optionSets: OptionSets;
}

/** `2026-04-01T00:00:00Z` → `2026-04-01` for <input type="date">. */
function toDateInput(value: unknown): string {
  if (!value) return "";
  const date = new Date(value as string);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function asString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function asArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function ResourceForm({
  resource,
  ui,
  recordId,
  initialValues,
  optionSets,
}: ResourceFormProps) {
  const router = useRouter();
  const isEdit = Boolean(recordId);

  const [values, setValues] = useState<Values>(() => {
    const seeded: Values = {};
    for (const field of ui.fields) {
      const raw = initialValues[field.name];
      switch (field.type) {
        case "checkbox":
          seeded[field.name] = Boolean(raw);
          break;
        case "date":
          seeded[field.name] = toDateInput(raw);
          break;
        case "tags":
        case "multiselect":
          seeded[field.name] = asArray(raw);
          break;
        default:
          seeded[field.name] = asString(raw);
      }
    }
    return seeded;
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sections = useMemo(() => {
    const grouped = new Map<string, FieldSpec[]>();
    for (const field of ui.fields) {
      const key = field.section ?? "Details";
      const list = grouped.get(key) ?? [];
      list.push(field);
      grouped.set(key, list);
    }
    return [...grouped];
  }, [ui.fields]);

  function set(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear the inline error as soon as the operator edits the field
    setFieldErrors((prev) =>
      prev[name] ? { ...prev, [name]: [] } : prev,
    );
  }

  /** Strips values the API would reject, e.g. "" where a number is expected. */
  function buildPayload(): Values {
    const payload: Values = {};
    for (const field of ui.fields) {
      const value = values[field.name];
      if (field.type === "number") {
        if (value === "" || value === null) {
          if (isEdit) payload[field.name] = null;
          continue;
        }
        payload[field.name] = Number(value);
        continue;
      }
      if (field.type === "date") {
        if (!value) {
          if (isEdit) payload[field.name] = null;
          continue;
        }
        payload[field.name] = new Date(String(value)).toISOString();
        continue;
      }
      if (field.name === "slug" && !value) continue;
      payload[field.name] = value;
    }
    return payload;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await fetch(
        isEdit ? `/api/admin/${resource}/${recordId}` : `/api/admin/${resource}`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(buildPayload()),
        },
      );
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (json.details) setFieldErrors(json.details);
        setFormError(json.error ?? `Request failed (${res.status}).`);
        return;
      }

      router.push(`/admin/${resource}`);
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!recordId) return;
    if (!confirm(`Delete this ${ui.singular.toLowerCase()}? This can be undone by an administrator.`)) return;

    setSaving(true);
    const res = await fetch(`/api/admin/${resource}/${recordId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.push(`/admin/${resource}`);
      router.refresh();
    } else {
      const json = await res.json().catch(() => ({}));
      setFormError(json.error ?? "Delete failed.");
      setSaving(false);
    }
  }

  function renderControl(field: FieldSpec) {
    const id = `field-${field.name}`;
    const errors = fieldErrors[field.name];
    const invalid = Boolean(errors?.length);
    const options =
      field.options ?? (field.optionsFrom ? optionSets[field.optionsFrom] ?? [] : []);

    if (field.type === "checkbox") {
      return (
        <Checkbox
          key={field.name}
          id={id}
          name={field.name}
          checked={Boolean(values[field.name])}
          onChange={(v) => set(field.name, v)}
          label={field.label}
        />
      );
    }

    const control = (() => {
      switch (field.type) {
        case "textarea":
          return (
            <TextArea
              id={id}
              name={field.name}
              rows={3}
              value={asString(values[field.name])}
              placeholder={field.placeholder}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "longtext":
          return (
            <TextArea
              id={id}
              name={field.name}
              rows={8}
              value={asString(values[field.name])}
              placeholder={field.placeholder}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "number":
          return (
            <NumberInput
              id={id}
              name={field.name}
              value={asString(values[field.name])}
              placeholder={field.placeholder}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "date":
          return (
            <DateInput
              id={id}
              name={field.name}
              value={asString(values[field.name])}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "select":
          return (
            <Select
              id={id}
              name={field.name}
              value={asString(values[field.name])}
              options={options}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "multiselect":
          return (
            <MultiSelect
              id={id}
              options={options}
              values={asArray(values[field.name])}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "tags":
          return (
            <TagsInput
              id={id}
              values={asArray(values[field.name])}
              placeholder={field.placeholder}
              onChange={(v) => set(field.name, v)}
            />
          );
        case "image":
          return (
            <FileField
              id={id}
              value={asString(values[field.name])}
              accept="image/*"
              preview
              onChange={(v) => set(field.name, v)}
            />
          );
        case "model":
          return (
            <FileField
              id={id}
              value={asString(values[field.name])}
              accept=".glb,.gltf"
              onChange={(v) => set(field.name, v)}
            />
          );
        default:
          return (
            <TextInput
              id={id}
              name={field.name}
              value={asString(values[field.name])}
              placeholder={field.placeholder}
              required={field.required}
              invalid={invalid}
              onChange={(v) => set(field.name, v)}
            />
          );
      }
    })();

    return (
      <FieldShell
        key={field.name}
        id={id}
        label={field.label}
        required={field.required}
        help={field.help}
        errors={errors}
      >
        {control}
      </FieldShell>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-5xl space-y-8">
      {formError && (
        <div
          role="alert"
          className="border border-red/40 bg-red/5 px-4 py-3 font-mono-label text-[11px] text-red"
        >
          {formError}
        </div>
      )}

      {sections.map(([name, fields]) => (
        <section key={name} className="border border-card-border bg-card">
          <h2 className="font-mono-label text-[10px] text-cyan px-6 py-3 border-b border-card-border">
            {name}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {fields.map((field) => (
              <div
                key={field.name}
                className={field.width === "full" ? "md:col-span-2" : undefined}
              >
                {renderControl(field)}
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={saving} withArrow={false}>
          {saving ? "SAVING…" : isEdit ? "SAVE CHANGES" : `CREATE ${ui.singular.toUpperCase()}`}
        </Button>
        <Link
          href={`/admin/${resource}`}
          className="font-mono-label text-[11px] text-muted hover:text-cyan"
        >
          CANCEL
        </Link>
        {isEdit && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="ml-auto font-mono-label text-[11px] text-red hover:text-red/80 disabled:opacity-50"
          >
            DELETE
          </button>
        )}
      </div>
    </form>
  );
}
