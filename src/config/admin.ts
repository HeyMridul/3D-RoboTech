export const adminNav = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Members", href: "/admin/members" },
  { label: "Events", href: "/admin/events" },
  { label: "Workshops", href: "/admin/workshops" },
  { label: "Achievements", href: "/admin/achievements" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Media", href: "/admin/media" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Settings", href: "/admin/settings" },
];

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "url"
  | "email"
  | "checkbox"
  | "select"
  | "date"
  | "tags";

export interface AdminField {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[];
}

export interface ResourceConfig {
  key: string;
  title: string;
  singular: string;
  listHref: string;
  columns: { key: string; label: string }[];
  fields: AdminField[];
}

const publishStatus = [
  { label: "Draft", value: "DRAFT" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Archived", value: "ARCHIVED" },
];

export const resourceConfigs: Record<string, ResourceConfig> = {
  projects: {
    key: "projects",
    title: "Projects",
    singular: "Project",
    listHref: "/admin/projects",
    columns: [
      { key: "title", label: "TITLE" },
      { key: "status", label: "BUILD" },
      { key: "publishStatus", label: "STATUS" },
      { key: "year", label: "YEAR" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "status", label: "Build status", type: "text" },
      { name: "year", label: "Year", type: "number" },
      { name: "imageUrl", label: "Image URL", type: "url" },
      { name: "modelUrl", label: "3D model URL (.glb)", type: "text" },
      { name: "githubUrl", label: "GitHub", type: "url" },
      { name: "demoUrl", label: "Demo", type: "url" },
      { name: "videoUrl", label: "Video", type: "url" },
      { name: "problem", label: "Problem", type: "textarea" },
      { name: "solution", label: "Solution", type: "textarea" },
      { name: "architecture", label: "Architecture", type: "textarea" },
      { name: "hardware", label: "Hardware", type: "textarea" },
      { name: "software", label: "Software", type: "textarea" },
      { name: "challenges", label: "Challenges", type: "textarea" },
      { name: "results", label: "Results", type: "textarea" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "order", label: "Order", type: "number" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
  members: {
    key: "members",
    title: "Members",
    singular: "Member",
    listHref: "/admin/members",
    columns: [
      { key: "name", label: "NAME" },
      { key: "role", label: "ROLE" },
      { key: "category", label: "CATEGORY" },
      { key: "publishStatus", label: "STATUS" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "role", label: "Role", type: "text", required: true },
      {
        name: "category",
        label: "Category",
        type: "select",
        options: [
          { label: "Core Team", value: "CORE_TEAM" },
          { label: "Coordinator", value: "COORDINATOR" },
          { label: "Mentor", value: "MENTOR" },
          { label: "Project Lead", value: "PROJECT_LEAD" },
          { label: "Member", value: "MEMBER" },
          { label: "Alumni", value: "ALUMNI" },
        ],
      },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "photoUrl", label: "Photo URL", type: "url" },
      { name: "skills", label: "Skills", type: "tags" },
      { name: "githubUrl", label: "GitHub", type: "url" },
      { name: "linkedinUrl", label: "LinkedIn", type: "url" },
      { name: "portfolioUrl", label: "Portfolio", type: "url" },
      { name: "email", label: "Email", type: "email" },
      { name: "active", label: "Active", type: "checkbox" },
      { name: "order", label: "Order", type: "number" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
  events: {
    key: "events",
    title: "Events",
    singular: "Event",
    listHref: "/admin/events",
    columns: [
      { key: "title", label: "TITLE" },
      { key: "type", label: "TYPE" },
      { key: "startDate", label: "DATE" },
      { key: "publishStatus", label: "STATUS" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Hackathon", value: "HACKATHON" },
          { label: "Workshop", value: "WORKSHOP" },
          { label: "Competition", value: "COMPETITION" },
          { label: "Tech Talk", value: "TECH_TALK" },
          { label: "Exhibition", value: "EXHIBITION" },
          { label: "Bootcamp", value: "BOOTCAMP" },
          { label: "Meeting", value: "MEETING" },
          { label: "Other", value: "OTHER" },
        ],
      },
      { name: "location", label: "Location", type: "text" },
      { name: "startDate", label: "Start", type: "date", required: true },
      { name: "endDate", label: "End", type: "date" },
      { name: "imageUrl", label: "Image URL", type: "url" },
      { name: "registrationUrl", label: "Registration URL", type: "url" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
  workshops: {
    key: "workshops",
    title: "Workshops",
    singular: "Workshop",
    listHref: "/admin/workshops",
    columns: [
      { key: "title", label: "TITLE" },
      { key: "track", label: "TRACK" },
      { key: "level", label: "LEVEL" },
      { key: "publishStatus", label: "STATUS" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "instructor", label: "Instructor", type: "text", required: true },
      { name: "track", label: "Track", type: "text", required: true },
      {
        name: "level",
        label: "Level",
        type: "select",
        options: [
          { label: "Beginner", value: "BEGINNER" },
          { label: "Intermediate", value: "INTERMEDIATE" },
          { label: "Advanced", value: "ADVANCED" },
        ],
      },
      { name: "duration", label: "Duration", type: "text" },
      { name: "startDate", label: "Date", type: "date" },
      { name: "resources", label: "Resources", type: "textarea" },
      { name: "registrationOpen", label: "Registration open", type: "checkbox" },
      { name: "maxSeats", label: "Max seats", type: "number" },
      { name: "imageUrl", label: "Image URL", type: "url" },
      { name: "order", label: "Order", type: "number" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
  achievements: {
    key: "achievements",
    title: "Achievements",
    singular: "Achievement",
    listHref: "/admin/achievements",
    columns: [
      { key: "title", label: "TITLE" },
      { key: "year", label: "YEAR" },
      { key: "rank", label: "RANK" },
      { key: "publishStatus", label: "STATUS" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "description", label: "Description", type: "textarea", required: true },
      { name: "year", label: "Year", type: "number", required: true },
      { name: "missionNumber", label: "Mission number", type: "number" },
      { name: "rank", label: "Rank", type: "text" },
      { name: "organization", label: "Organization", type: "text" },
      { name: "imageUrl", label: "Image URL", type: "url" },
      { name: "featured", label: "Featured", type: "checkbox" },
      { name: "order", label: "Order", type: "number" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
  blog: {
    key: "blog",
    title: "Blog",
    singular: "Post",
    listHref: "/admin/blog",
    columns: [
      { key: "title", label: "TITLE" },
      { key: "publishStatus", label: "STATUS" },
      { key: "updatedAt", label: "UPDATED" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "Slug", type: "text" },
      { name: "excerpt", label: "Excerpt", type: "textarea" },
      { name: "content", label: "Content", type: "textarea", required: true },
      { name: "coverImage", label: "Cover image", type: "url" },
      { name: "publishStatus", label: "Publish", type: "select", options: publishStatus },
    ],
  },
};
