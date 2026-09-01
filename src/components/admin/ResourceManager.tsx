"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

type Item = Record<string, unknown> & { id: string };
type Resource =
  | "members"
  | "events"
  | "workshops"
  | "achievements"
  | "blog"
  | "gallery"
  | "settings";
type Field = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "select" | "csv";
  options?: string[];
  required?: boolean;
};

const fields: Record<Resource, Field[]> = {
  members: [
    { name: "name", label: "Name", required: true },
    { name: "role", label: "Role", required: true },
    {
      name: "category",
      label: "Category",
      type: "select",
      options: ["CORE_TEAM", "COORDINATOR", "MENTOR", "PROJECT_LEAD", "MEMBER", "ALUMNI"],
      required: true,
    },
    { name: "bio", label: "Biography", type: "textarea" },
    { name: "skills", label: "Skills (comma separated)", type: "csv" },
    { name: "photoUrl", label: "Photo URL" },
  ],
  events: [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    {
      name: "type",
      label: "Type",
      type: "select",
      options: ["HACKATHON", "WORKSHOP", "COMPETITION", "TECH_TALK", "EXHIBITION", "BOOTCAMP", "MEETING", "OTHER"],
      required: true,
    },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "location", label: "Location" },
    { name: "registrationUrl", label: "Registration URL" },
  ],
  workshops: [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "instructor", label: "Instructor", required: true },
    { name: "track", label: "Track", required: true },
    {
      name: "level",
      label: "Level",
      type: "select",
      options: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
      required: true,
    },
    { name: "startDate", label: "Start date", type: "date" },
    { name: "duration", label: "Duration" },
    { name: "maxSeats", label: "Maximum seats", type: "number" },
  ],
  achievements: [
    { name: "title", label: "Title", required: true },
    { name: "description", label: "Description", type: "textarea", required: true },
    { name: "year", label: "Year", type: "number", required: true },
    { name: "missionNumber", label: "Mission number", type: "number" },
    { name: "rank", label: "Result / rank" },
    { name: "organization", label: "Organization" },
  ],
  blog: [
    { name: "title", label: "Title", required: true },
    { name: "excerpt", label: "Excerpt", type: "textarea" },
    { name: "content", label: "Article", type: "textarea", required: true },
    { name: "coverImage", label: "Cover image URL" },
  ],
  gallery: [
    { name: "title", label: "Title" },
    { name: "caption", label: "Caption", type: "textarea" },
    { name: "imageUrl", label: "Image URL", required: true },
    { name: "projectId", label: "Project ID" },
    { name: "order", label: "Display order", type: "number" },
  ],
  settings: [
    { name: "key", label: "Setting key", required: true },
    { name: "value", label: "Value", type: "textarea", required: true },
  ],
};

const defaults: Record<Resource, Record<string, unknown>> = {
  members: { category: "MEMBER", skills: [], active: true, publishStatus: "DRAFT", order: 0 },
  events: { type: "OTHER", publishStatus: "DRAFT", featured: false },
  workshops: { level: "BEGINNER", registrationOpen: true, publishStatus: "DRAFT", order: 0 },
  achievements: { publishStatus: "DRAFT", featured: false, order: 0 },
  blog: { publishStatus: "DRAFT" },
  gallery: { order: 0 },
  settings: {},
};

function formValue(item: Item | null, field: Field) {
  const value = item?.[field.name];
  if (field.type === "csv" && Array.isArray(value)) return value.join(", ");
  if (field.type === "date" && value) return new Date(String(value)).toISOString().slice(0, 16);
  return value == null ? "" : String(value);
}

export function ResourceManager({
  resource,
  initialItems,
}: {
  resource: Resource;
  initialItems: Item[];
}) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Item | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");
  const resourceFields = useMemo(() => fields[resource], [resource]);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("SAVING...");
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = editing ? {} : { ...defaults[resource] };

    resourceFields.forEach((field) => {
      const raw = String(form.get(field.name) || "").trim();
      if (!raw && !field.required) return;
      if (field.type === "number") payload[field.name] = raw ? Number(raw) : null;
      else if (field.type === "csv") payload[field.name] = raw ? raw.split(",").map((value) => value.trim()).filter(Boolean) : [];
      else payload[field.name] = raw;
    });

    const response = await fetch(
      editing ? `/api/admin/${resource}/${editing.id}` : `/api/admin/${resource}`,
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json();
    if (!response.ok) {
      setStatus(body.error || "SAVE FAILED");
      return;
    }

    setItems((current) =>
      editing
        ? current.map((item) => (item.id === body.id ? body : item))
        : [body, ...current],
    );
    setEditing(null);
    setShowForm(false);
    setStatus("SAVED");
  }

  async function updateStatus(item: Item, publishStatus: string) {
    const response = await fetch(`/api/admin/${resource}/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publishStatus }),
    });
    if (response.ok) {
      const updated = await response.json();
      setItems((current) => current.map((entry) => entry.id === item.id ? updated : entry));
    }
  }

  async function remove(item: Item) {
    if (!window.confirm(`Archive ${String(item.title || item.name || item.key)}?`)) return;
    const response = await fetch(`/api/admin/${resource}/${item.id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-label text-cyan">CONTENT CONTROL</p>
          <h1 className="font-display text-3xl font-bold capitalize">{resource}</h1>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          + NEW ENTRY
        </Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="technical-panel mb-8 grid gap-4 p-5 md:grid-cols-2">
          {resourceFields.map((field) => (
            <label key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              <span className="font-mono-label text-[10px] text-muted">{field.label}</span>
              {field.type === "textarea" ? (
                <textarea name={field.name} defaultValue={formValue(editing, field)} required={field.required} rows={5} className="mt-1 w-full border border-card-border px-3 py-2" />
              ) : field.type === "select" ? (
                <select name={field.name} defaultValue={formValue(editing, field) || field.options?.[0]} className="mt-1 w-full border border-card-border px-3 py-2">
                  {field.options?.map((option) => <option key={option}>{option}</option>)}
                </select>
              ) : (
                <input name={field.name} type={field.type === "date" ? "datetime-local" : field.type === "number" ? "number" : "text"} defaultValue={formValue(editing, field)} required={field.required} className="mt-1 w-full border border-card-border px-3 py-2" />
              )}
            </label>
          ))}
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit">{editing ? "SAVE CHANGES" : "CREATE ENTRY"}</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>CANCEL</Button>
            <span aria-live="polite" className="font-mono-label text-[10px] text-muted">{status}</span>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {items.length === 0 && <div className="technical-panel p-10 text-center font-mono-label text-muted">NO RECORDS</div>}
        {items.map((item) => (
          <article key={item.id} className="technical-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">{String(item.title || item.name || item.key)}</h2>
              <p className="font-mono-label mt-1 text-[9px] text-muted">
                {String(item.publishStatus || item.status || "")}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {"publishStatus" in item && (
                <button onClick={() => updateStatus(item, item.publishStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} className="border border-card-border px-3 py-2 font-mono-label text-[9px] text-cyan">
                  {item.publishStatus === "PUBLISHED" ? "UNPUBLISH" : "PUBLISH"}
                </button>
              )}
              <button onClick={() => { setEditing(item); setShowForm(true); }} className="border border-card-border px-3 py-2 font-mono-label text-[9px]">EDIT</button>
              <button onClick={() => remove(item)} className="border border-red/30 px-3 py-2 font-mono-label text-[9px] text-red">ARCHIVE</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
