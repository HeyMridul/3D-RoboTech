/**
 * Dev-only end-to-end check of the admin API: signs in through NextAuth with
 * the seeded credentials, then exercises the generic CRUD surface.
 * Usage: node scripts/api-smoke.mjs
 */
const BASE = "http://localhost:3000";

let cookies = new Map();

function cookieHeader() {
  return [...cookies].map(([k, v]) => `${k}=${v}`).join("; ");
}

function absorb(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    cookies.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}

async function req(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    redirect: "manual",
    headers: {
      ...(init.headers ?? {}),
      ...(cookieHeader() ? { cookie: cookieHeader() } : {}),
    },
  });
  absorb(res);
  return res;
}

const results = [];
function check(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
}

// ---- unauthenticated access must be refused -------------------------------
let res = await req("/api/admin/projects");
check("GET /api/admin/projects without session → 401", res.status === 401, `got ${res.status}`);

res = await req("/api/admin/members", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "Intruder", role: "x", category: "MEMBER" }),
});
check("POST /api/admin/members without session → 401", res.status === 401, `got ${res.status}`);

// ---- sign in --------------------------------------------------------------
const csrfRes = await req("/api/auth/csrf");
const { csrfToken } = await csrfRes.json();

res = await req("/api/auth/callback/credentials", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    csrfToken,
    email: process.env.ADMIN_EMAIL ?? "admin@traic.dev",
    password: process.env.ADMIN_PASSWORD ?? "TraicAdmin2026!",
  }),
});
const sessionRes = await req("/api/auth/session");
const session = await sessionRes.json();
check("credentials sign-in establishes session", Boolean(session?.user?.email), JSON.stringify(session).slice(0, 120));

// ---- authenticated reads --------------------------------------------------
res = await req("/api/admin/projects");
const list = await res.json();
check("GET /api/admin/projects → 200 with items", res.status === 200 && Array.isArray(list.items), `${res.status}, total=${list.total}`);

res = await req("/api/admin/nonsense");
check("unknown resource → 404", res.status === 404, `got ${res.status}`);

// ---- validation -----------------------------------------------------------
res = await req("/api/admin/members", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "x", role: "", category: "NOT_A_CATEGORY" }),
});
const invalid = await res.json();
check("invalid payload → 400 with field details", res.status === 400 && Boolean(invalid.details), `got ${res.status}`);

// ---- create / read / update / delete --------------------------------------
const unique = Date.now();
res = await req("/api/admin/members", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    name: `Smoke Test Member ${unique}`,
    role: "Test Engineer",
    category: "MEMBER",
    skills: ["testing"],
    email: "",
  }),
});
const created = await res.json();
check("POST create member → 201", res.status === 201 && Boolean(created.id), `got ${res.status} ${JSON.stringify(created).slice(0, 160)}`);
check("slug auto-derived from name", typeof created.slug === "string" && created.slug.startsWith("smoke-test-member"), `slug=${created.slug}`);
check("empty email stored as NULL", created.email === null, `email=${JSON.stringify(created.email)}`);

if (created.id) {
  res = await req(`/api/admin/members/${created.id}`);
  check("GET one member → 200", res.status === 200, `got ${res.status}`);

  res = await req(`/api/admin/members/${created.id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ role: "Lead Test Engineer" }),
  });
  const patched = await res.json();
  check("PATCH partial update → 200", res.status === 200 && patched.role === "Lead Test Engineer", `got ${res.status} role=${patched.role}`);

  res = await req(`/api/admin/members/${created.id}`, { method: "DELETE" });
  check("DELETE → 200", res.status === 200, `got ${res.status}`);

  res = await req(`/api/admin/members/${created.id}`);
  check("soft-deleted member no longer readable → 404", res.status === 404, `got ${res.status}`);
}

// ---- duplicate handling ---------------------------------------------------
res = await req("/api/admin/technologies", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "ROS" }),
});
check("duplicate unique field → 409", res.status === 409, `got ${res.status}`);

// ---- public endpoints -----------------------------------------------------
res = await fetch(`${BASE}/api/projects`);
check("public GET /api/projects → 200", res.status === 200, `got ${res.status}`);

res = await fetch(`${BASE}/api/contact`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ name: "a", email: "nope", message: "short" }),
});
check("public contact invalid → 400", res.status === 400, `got ${res.status}`);

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
