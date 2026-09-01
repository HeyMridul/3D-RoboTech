import { z } from "zod";

/**
 * Every write that reaches the database is parsed through one of these.
 * Public submissions (application, contact) are deliberately stricter than
 * admin writes, since they are unauthenticated.
 */

/** Optional URL field that tolerates the empty string a cleared input sends. */
const optionalUrl = z
  .union([z.string().url().max(500), z.literal("")])
  .optional()
  .nullable();

const optionalText = z.string().max(20_000).optional().nullable();
const slug = z
  .string()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9-]+$/, "Slug may contain lowercase letters, numbers and hyphens only");

const publishStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

/* -------------------------------------------------------------------------- */
/* Public submissions                                                          */
/* -------------------------------------------------------------------------- */

export const applicationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  year: z.string().min(1).max(50),
  branch: z.string().min(1).max(100),
  interests: z.array(z.string().max(100)).min(1).max(10),
  skills: z.array(z.string().max(100)).max(20).default([]),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  message: z.string().min(10).max(5000),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

/* -------------------------------------------------------------------------- */
/* Admin-managed content                                                       */
/* -------------------------------------------------------------------------- */

export const projectSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slug.optional(),
  description: z.string().min(10).max(2000),
  excerpt: z.string().max(500).optional().nullable(),
  status: z.string().max(50).optional(),
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  modelUrl: z.string().max(500).optional().nullable(),
  githubUrl: optionalUrl,
  demoUrl: optionalUrl,
  videoUrl: optionalUrl,
  year: z.coerce.number().int().min(1900).max(2200).optional().nullable(),
  achievement: z.string().max(300).optional().nullable(),
  problem: optionalText,
  solution: optionalText,
  architecture: optionalText,
  hardware: optionalText,
  software: optionalText,
  challenges: optionalText,
  results: optionalText,
  featured: z.coerce.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  publishStatus: publishStatus.optional(),
  technologyIds: z.array(z.string()).max(40).optional(),
  contributorIds: z.array(z.string()).max(60).optional(),
});

export const memberSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slug.optional(),
  role: z.string().min(2).max(120),
  category: z.enum([
    "CORE_TEAM",
    "COORDINATOR",
    "MENTOR",
    "PROJECT_LEAD",
    "MEMBER",
    "ALUMNI",
  ]),
  bio: optionalText,
  photoUrl: z.string().max(500).optional().nullable(),
  skills: z.array(z.string().max(60)).max(30).optional(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  email: z.union([z.string().email().max(255), z.literal("")]).optional().nullable(),
  active: z.coerce.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  publishStatus: publishStatus.optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slug.optional(),
  description: z.string().min(10).max(20_000),
  type: z.enum([
    "HACKATHON",
    "WORKSHOP",
    "COMPETITION",
    "TECH_TALK",
    "EXHIBITION",
    "BOOTCAMP",
    "MEETING",
    "OTHER",
  ]),
  location: z.string().max(200).optional().nullable(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  registrationUrl: optionalUrl,
  featured: z.coerce.boolean().optional(),
  publishStatus: publishStatus.optional(),
});

export const workshopSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slug.optional(),
  description: z.string().min(10).max(20_000),
  instructor: z.string().min(2).max(120),
  track: z.string().min(2).max(80),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.string().max(80).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  resources: z.string().max(2000).optional().nullable(),
  registrationOpen: z.coerce.boolean().optional(),
  maxSeats: z.coerce.number().int().min(1).max(10_000).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  publishStatus: publishStatus.optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slug.optional(),
  description: z.string().min(10).max(20_000),
  year: z.coerce.number().int().min(1900).max(2200),
  missionNumber: z.coerce.number().int().min(0).max(99_999).optional().nullable(),
  rank: z.string().max(80).optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  featured: z.coerce.boolean().optional(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
  publishStatus: publishStatus.optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(2).max(200),
  slug: slug.optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(10).max(100_000),
  coverImage: z.string().max(500).optional().nullable(),
  publishStatus: publishStatus.optional(),
  publishedAt: z.coerce.date().optional().nullable(),
});

export const galleryItemSchema = z.object({
  title: z.string().max(200).optional().nullable(),
  caption: z.string().max(500).optional().nullable(),
  imageUrl: z.string().min(1).max(500),
  projectId: z.string().optional().nullable(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
});

export const technologySchema = z.object({
  name: z.string().min(1).max(80),
  slug: slug.optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(200).optional().nullable(),
});

export const categorySchema = z.object({
  name: z.string().min(1).max(80),
  slug: slug.optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
  order: z.coerce.number().int().min(0).max(9999).optional(),
});

/* -------------------------------------------------------------------------- */
/* Inbox triage                                                                */
/* -------------------------------------------------------------------------- */

export const applicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"]),
});

export const messageReadSchema = z.object({
  read: z.coerce.boolean(),
});

export const siteSettingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string().max(5000),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type WorkshopInput = z.infer<typeof workshopSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
export type BlogPostInput = z.infer<typeof blogPostSchema>;
export type GalleryItemInput = z.infer<typeof galleryItemSchema>;
