import type { ResourceName } from "@/server/admin/resources";

/**
 * Presentation layer for the CMS. The API decides what is *allowed*
 * (src/server/admin/resources.ts); this decides how it is *edited*, so adding
 * a field to a form is a one-line change in one file.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "longtext"
  | "number"
  | "select"
  | "checkbox"
  | "date"
  | "tags"
  | "image"
  | "model"
  | "multiselect";

export interface FieldSpec {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  /** Populated at render time from the database. */
  optionsFrom?: "categories" | "technologies" | "members" | "projects";
  /** Fields marked `full` span both form columns. */
  width?: "half" | "full";
  section?: string;
}

export interface ColumnSpec {
  key: string;
  label: string;
  /** Dotted path for relations, e.g. "category.name". */
  path?: string;
  type?: "text" | "badge" | "status" | "date" | "boolean";
}

export interface ResourceUi {
  title: string;
  singular: string;
  description: string;
  columns: ColumnSpec[];
  fields: FieldSpec[];
  /** Field used for the page heading when editing. */
  titleField: string;
  /** Public URL pattern for a "view live" link, `:slug` substituted. */
  publicPath?: string;
}

const PUBLISH_FIELD: FieldSpec = {
  name: "publishStatus",
  label: "Publish status",
  type: "select",
  options: [
    { value: "DRAFT", label: "Draft" },
    { value: "PUBLISHED", label: "Published" },
    { value: "ARCHIVED", label: "Archived" },
  ],
  section: "Publishing",
};

const SLUG_FIELD: FieldSpec = {
  name: "slug",
  label: "Slug",
  type: "text",
  placeholder: "auto-generated from the title",
  help: "Lowercase letters, numbers and hyphens. Leave blank to generate.",
  section: "Publishing",
};

const ORDER_FIELD: FieldSpec = {
  name: "order",
  label: "Sort order",
  type: "number",
  help: "Lower numbers appear first.",
  section: "Publishing",
};

export const RESOURCE_UI: Record<ResourceName, ResourceUi> = {
  projects: {
    title: "Projects",
    singular: "Project",
    description: "Engineering dossiers shown in the project explorer.",
    titleField: "title",
    publicPath: "/projects/:slug",
    columns: [
      { key: "title", label: "Title" },
      { key: "category", label: "Category", path: "category.name", type: "badge" },
      { key: "year", label: "Year" },
      { key: "featured", label: "Featured", type: "boolean" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, section: "Overview" },
      {
        name: "description",
        label: "Short description",
        type: "textarea",
        required: true,
        width: "full",
        help: "One or two sentences, shown on the project card.",
        section: "Overview",
      },
      { name: "excerpt", label: "Excerpt", type: "text", width: "full", section: "Overview" },
      {
        name: "status",
        label: "Build status",
        type: "select",
        options: [
          { value: "CONCEPT", label: "Concept" },
          { value: "IN_PROGRESS", label: "In progress" },
          { value: "DEPLOYED", label: "Deployed" },
          { value: "ARCHIVED", label: "Archived" },
        ],
        section: "Overview",
      },
      { name: "categoryId", label: "Category", type: "select", optionsFrom: "categories", section: "Overview" },
      { name: "year", label: "Year", type: "number", section: "Overview" },
      { name: "achievement", label: "Achievement", type: "text", section: "Overview" },

      { name: "imageUrl", label: "Cover image", type: "image", section: "Media" },
      { name: "modelUrl", label: "3D model (.glb)", type: "model", help: "Shown in the interactive component viewer.", section: "Media" },
      { name: "videoUrl", label: "Video URL", type: "text", section: "Media" },
      { name: "githubUrl", label: "GitHub URL", type: "text", section: "Media" },
      { name: "demoUrl", label: "Demo URL", type: "text", section: "Media" },

      { name: "problem", label: "Problem", type: "longtext", width: "full", section: "Dossier" },
      { name: "solution", label: "Solution", type: "longtext", width: "full", section: "Dossier" },
      { name: "architecture", label: "Architecture", type: "longtext", width: "full", section: "Dossier" },
      { name: "hardware", label: "Hardware", type: "longtext", width: "full", section: "Dossier" },
      { name: "software", label: "Software", type: "longtext", width: "full", section: "Dossier" },
      { name: "challenges", label: "Challenges", type: "longtext", width: "full", section: "Dossier" },
      { name: "results", label: "Results", type: "longtext", width: "full", section: "Dossier" },

      { name: "technologyIds", label: "Technologies", type: "multiselect", optionsFrom: "technologies", width: "full", section: "Relations" },
      { name: "contributorIds", label: "Contributors", type: "multiselect", optionsFrom: "members", width: "full", section: "Relations" },

      { name: "featured", label: "Feature on the homepage", type: "checkbox", section: "Publishing" },
      ORDER_FIELD,
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  members: {
    title: "Members",
    singular: "Member",
    description: "The people behind the technology.",
    titleField: "name",
    publicPath: "/members/:slug",
    columns: [
      { key: "name", label: "Name" },
      { key: "role", label: "Role" },
      { key: "category", label: "Category", type: "badge" },
      { key: "active", label: "Active", type: "boolean" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Full name", type: "text", required: true, section: "Profile" },
      { name: "role", label: "Role", type: "text", required: true, placeholder: "Project Lead", section: "Profile" },
      {
        name: "category",
        label: "Category",
        type: "select",
        required: true,
        options: [
          { value: "CORE_TEAM", label: "Core team" },
          { value: "COORDINATOR", label: "Coordinator" },
          { value: "MENTOR", label: "Mentor" },
          { value: "PROJECT_LEAD", label: "Project lead" },
          { value: "MEMBER", label: "Member" },
          { value: "ALUMNI", label: "Alumni" },
        ],
        section: "Profile",
      },
      { name: "photoUrl", label: "Photo", type: "image", section: "Profile" },
      { name: "bio", label: "Biography", type: "longtext", width: "full", section: "Profile" },
      { name: "skills", label: "Skills", type: "tags", width: "full", help: "Press Enter to add each skill.", section: "Profile" },

      { name: "email", label: "Email", type: "text", section: "Links" },
      { name: "githubUrl", label: "GitHub URL", type: "text", section: "Links" },
      { name: "linkedinUrl", label: "LinkedIn URL", type: "text", section: "Links" },
      { name: "portfolioUrl", label: "Portfolio URL", type: "text", section: "Links" },

      { name: "active", label: "Currently active", type: "checkbox", section: "Publishing" },
      ORDER_FIELD,
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  events: {
    title: "Events",
    singular: "Event",
    description: "Hackathons, competitions, talks and exhibitions.",
    titleField: "title",
    publicPath: "/events/:slug",
    columns: [
      { key: "title", label: "Title" },
      { key: "type", label: "Type", type: "badge" },
      { key: "startDate", label: "Starts", type: "date" },
      { key: "location", label: "Location" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, section: "Details" },
      {
        name: "type",
        label: "Type",
        type: "select",
        required: true,
        options: [
          { value: "HACKATHON", label: "Hackathon" },
          { value: "WORKSHOP", label: "Workshop" },
          { value: "COMPETITION", label: "Competition" },
          { value: "TECH_TALK", label: "Tech talk" },
          { value: "EXHIBITION", label: "Exhibition" },
          { value: "BOOTCAMP", label: "Bootcamp" },
          { value: "MEETING", label: "Meeting" },
          { value: "OTHER", label: "Other" },
        ],
        section: "Details",
      },
      { name: "startDate", label: "Start date", type: "date", required: true, section: "Details" },
      { name: "endDate", label: "End date", type: "date", section: "Details" },
      { name: "location", label: "Location", type: "text", section: "Details" },
      { name: "registrationUrl", label: "Registration URL", type: "text", section: "Details" },
      { name: "description", label: "Description", type: "longtext", required: true, width: "full", section: "Details" },
      { name: "imageUrl", label: "Image", type: "image", section: "Media" },
      { name: "featured", label: "Feature on the homepage", type: "checkbox", section: "Publishing" },
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  workshops: {
    title: "Workshops",
    singular: "Workshop",
    description: "Learning tracks and technical classes.",
    titleField: "title",
    publicPath: "/workshops/:slug",
    columns: [
      { key: "title", label: "Title" },
      { key: "track", label: "Track", type: "badge" },
      { key: "level", label: "Level", type: "badge" },
      { key: "instructor", label: "Instructor" },
      { key: "registrationOpen", label: "Open", type: "boolean" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, section: "Details" },
      { name: "instructor", label: "Instructor", type: "text", required: true, section: "Details" },
      {
        name: "track",
        label: "Track",
        type: "select",
        required: true,
        options: [
          { value: "Hardware", label: "Hardware" },
          { value: "Software", label: "Software" },
          { value: "AI", label: "AI" },
          { value: "Robotics", label: "Robotics" },
        ],
        section: "Details",
      },
      {
        name: "level",
        label: "Level",
        type: "select",
        required: true,
        options: [
          { value: "BEGINNER", label: "Beginner" },
          { value: "INTERMEDIATE", label: "Intermediate" },
          { value: "ADVANCED", label: "Advanced" },
        ],
        section: "Details",
      },
      { name: "duration", label: "Duration", type: "text", placeholder: "3 hours", section: "Details" },
      { name: "startDate", label: "Start date", type: "date", section: "Details" },
      { name: "maxSeats", label: "Maximum seats", type: "number", section: "Details" },
      { name: "description", label: "Description", type: "longtext", required: true, width: "full", section: "Details" },
      { name: "resources", label: "Resources", type: "textarea", width: "full", help: "Links or notes handed out to attendees.", section: "Details" },
      { name: "imageUrl", label: "Image", type: "image", section: "Media" },
      { name: "registrationOpen", label: "Registration open", type: "checkbox", section: "Publishing" },
      ORDER_FIELD,
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  achievements: {
    title: "Achievements",
    singular: "Achievement",
    description: "The TRAIC mission log.",
    titleField: "title",
    columns: [
      { key: "title", label: "Title" },
      { key: "year", label: "Year" },
      { key: "rank", label: "Result", type: "badge" },
      { key: "organization", label: "Organisation" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, section: "Details" },
      { name: "year", label: "Year", type: "number", required: true, section: "Details" },
      { name: "missionNumber", label: "Mission number", type: "number", section: "Details" },
      { name: "rank", label: "Result", type: "text", placeholder: "First place", section: "Details" },
      { name: "organization", label: "Organisation", type: "text", section: "Details" },
      { name: "description", label: "Description", type: "longtext", required: true, width: "full", section: "Details" },
      { name: "imageUrl", label: "Image", type: "image", section: "Media" },
      { name: "featured", label: "Feature on the homepage", type: "checkbox", section: "Publishing" },
      ORDER_FIELD,
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  blog: {
    title: "Blog",
    singular: "Post",
    description: "Write-ups, build logs and technical articles.",
    titleField: "title",
    publicPath: "/blog/:slug",
    columns: [
      { key: "title", label: "Title" },
      { key: "publishedAt", label: "Published", type: "date" },
      { key: "publishStatus", label: "Status", type: "status" },
    ],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, section: "Post" },
      { name: "excerpt", label: "Excerpt", type: "textarea", width: "full", section: "Post" },
      { name: "content", label: "Content", type: "longtext", required: true, width: "full", help: "Plain text or Markdown.", section: "Post" },
      { name: "coverImage", label: "Cover image", type: "image", section: "Media" },
      { name: "publishedAt", label: "Publish date", type: "date", section: "Publishing" },
      SLUG_FIELD,
      PUBLISH_FIELD,
    ],
  },

  gallery: {
    title: "Gallery",
    singular: "Gallery item",
    description: "Photographs from builds, events and the lab.",
    titleField: "title",
    columns: [
      { key: "title", label: "Title" },
      { key: "project", label: "Project", path: "project.title", type: "badge" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "imageUrl", label: "Image", type: "image", required: true, width: "full", section: "Item" },
      { name: "title", label: "Title", type: "text", section: "Item" },
      { name: "projectId", label: "Project", type: "select", optionsFrom: "projects", section: "Item" },
      { name: "caption", label: "Caption", type: "textarea", width: "full", section: "Item" },
      ORDER_FIELD,
    ],
  },

  technologies: {
    title: "Technologies",
    singular: "Technology",
    description: "The stack tags attached to projects.",
    titleField: "name",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, section: "Technology" },
      { name: "description", label: "Description", type: "textarea", width: "full", section: "Technology" },
      { name: "icon", label: "Icon", type: "text", section: "Technology" },
      SLUG_FIELD,
    ],
  },

  categories: {
    title: "Categories",
    singular: "Category",
    description: "Groupings used by the project explorer filters.",
    titleField: "name",
    columns: [
      { key: "name", label: "Name" },
      { key: "slug", label: "Slug" },
      { key: "order", label: "Order" },
    ],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, section: "Category" },
      { name: "description", label: "Description", type: "textarea", width: "full", section: "Category" },
      { name: "color", label: "Accent colour", type: "text", placeholder: "#22d3ee", section: "Category" },
      ORDER_FIELD,
      SLUG_FIELD,
    ],
  },
};

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Members", href: "/admin/members" },
  { label: "Events", href: "/admin/events" },
  { label: "Workshops", href: "/admin/workshops" },
  { label: "Achievements", href: "/admin/achievements" },
  { label: "Blog", href: "/admin/blog" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Technologies", href: "/admin/technologies" },
  { label: "Categories", href: "/admin/categories" },
  { label: "Media", href: "/admin/media" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Messages", href: "/admin/messages" },
  { label: "Settings", href: "/admin/settings" },
];
