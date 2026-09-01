"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { TechBadge } from "@/components/ui/TechBadge";

type Project = {
  id: string;
  title: string;
  description: string;
  status: string;
  publishStatus: string;
  categoryId: string | null;
  category: { name: string } | null;
  year: number | null;
  featured: boolean;
  imageUrl: string | null;
  githubUrl: string | null;
  demoUrl: string | null;
};

export function ProjectsManager({
  initialProjects,
  categories,
}: {
  initialProjects: Project[];
  categories: { id: string; name: string }[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [status, setStatus] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("SAVING...");
    const form = new FormData(event.currentTarget);
    const payload = {
      title: String(form.get("title")),
      description: String(form.get("description")),
      status: String(form.get("status")),
      categoryId: String(form.get("categoryId")) || null,
      year: form.get("year") ? Number(form.get("year")) : null,
      imageUrl: String(form.get("imageUrl")) || null,
      githubUrl: String(form.get("githubUrl")) || null,
      demoUrl: String(form.get("demoUrl")) || null,
      featured: form.get("featured") === "on",
      publishStatus: String(form.get("publishStatus")),
    };
    const response = await fetch(
      editing ? `/api/admin/projects/${editing.id}` : "/api/admin/projects",
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
    const category = categories.find((item) => item.id === body.categoryId) || null;
    const normalized = {
      ...body,
      category: category ? { name: category.name } : null,
    };
    setProjects((current) =>
      editing
        ? current.map((item) => item.id === editing.id ? normalized : item)
        : [normalized, ...current],
    );
    setEditing(null);
    setShowForm(false);
    setStatus("SAVED");
  }

  async function remove(project: Project) {
    if (!window.confirm(`Archive ${project.title}?`)) return;
    const response = await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    if (response.ok) setProjects((current) => current.filter((item) => item.id !== project.id));
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono-label text-cyan">PROJECT DATABASE</p>
          <h1 className="font-display text-3xl font-bold">Projects</h1>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>+ NEW PROJECT</Button>
      </div>

      {showForm && (
        <form onSubmit={save} className="technical-panel mb-8 grid gap-4 p-5 md:grid-cols-2">
          <input name="title" required minLength={2} defaultValue={editing?.title} placeholder="Project title" className="border border-card-border px-3 py-2" />
          <select name="categoryId" defaultValue={editing?.categoryId || ""} className="border border-card-border px-3 py-2">
            <option value="">No category</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <textarea name="description" required minLength={10} defaultValue={editing?.description} placeholder="Project description" rows={5} className="border border-card-border px-3 py-2 md:col-span-2" />
          <input name="status" defaultValue={editing?.status || "IN_PROGRESS"} placeholder="Engineering status" className="border border-card-border px-3 py-2" />
          <input name="year" type="number" min={2000} max={2200} defaultValue={editing?.year || ""} placeholder="Year" className="border border-card-border px-3 py-2" />
          <input name="imageUrl" type="url" defaultValue={editing?.imageUrl || ""} placeholder="Image URL" className="border border-card-border px-3 py-2" />
          <input name="githubUrl" type="url" defaultValue={editing?.githubUrl || ""} placeholder="GitHub URL" className="border border-card-border px-3 py-2" />
          <input name="demoUrl" type="url" defaultValue={editing?.demoUrl || ""} placeholder="Demo URL" className="border border-card-border px-3 py-2" />
          <select name="publishStatus" defaultValue={editing?.publishStatus || "DRAFT"} className="border border-card-border px-3 py-2">
            <option>DRAFT</option><option>PUBLISHED</option><option>ARCHIVED</option>
          </select>
          <label className="flex items-center gap-2 font-mono-label text-[10px] text-muted">
            <input name="featured" type="checkbox" defaultChecked={editing?.featured} /> FEATURED PROJECT
          </label>
          <div className="flex items-center gap-3 md:col-span-2">
            <Button type="submit">{editing ? "SAVE PROJECT" : "CREATE PROJECT"}</Button>
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>CANCEL</Button>
            <span aria-live="polite" className="font-mono-label text-[9px] text-muted">{status}</span>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {projects.length === 0 && <div className="technical-panel p-10 text-center font-mono-label text-muted">NO PROJECTS</div>}
        {projects.map((project) => (
          <article key={project.id} className="technical-panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">{project.title}</h2>
              <div className="mt-2 flex gap-2">
                {project.category && <TechBadge>{project.category.name}</TechBadge>}
                <TechBadge variant={project.publishStatus === "PUBLISHED" ? "green" : "default"}>{project.publishStatus}</TechBadge>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setEditing(project); setShowForm(true); }} className="border border-card-border px-3 py-2 font-mono-label text-[9px] text-cyan">EDIT</button>
              <button onClick={() => remove(project)} className="border border-red/30 px-3 py-2 font-mono-label text-[9px] text-red">ARCHIVE</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
