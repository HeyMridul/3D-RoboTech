import { z } from "zod";

export const applicationSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  year: z.string().min(1).max(50),
  branch: z.string().min(1).max(100),
  interests: z.array(z.string()).min(1).max(10),
  skills: z.array(z.string()).max(20).default([]),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
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
  password: z.string().min(8),
});

export const projectSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10),
  excerpt: z.string().optional(),
  status: z.string().optional(),
  categoryId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  modelUrl: z.string().optional().nullable(),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  demoUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  year: z.number().int().optional().nullable(),
  achievement: z.string().optional().nullable(),
  problem: z.string().optional().nullable(),
  solution: z.string().optional().nullable(),
  architecture: z.string().optional().nullable(),
  hardware: z.string().optional().nullable(),
  software: z.string().optional().nullable(),
  challenges: z.string().optional().nullable(),
  results: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  publishStatus: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
  technologyIds: z.array(z.string()).optional(),
  contributorIds: z.array(z.string()).optional(),
});

const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const optionalUrl = z.string().url().optional().nullable().or(z.literal(""));

export const memberSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(160).optional(),
  role: z.string().min(2).max(120),
  category: z.enum([
    "CORE_TEAM",
    "COORDINATOR",
    "MENTOR",
    "PROJECT_LEAD",
    "MEMBER",
    "ALUMNI",
  ]),
  bio: z.string().max(10000).optional().nullable(),
  photoUrl: optionalUrl,
  skills: z.array(z.string().min(1).max(80)).max(30).default([]),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  email: z.string().email().optional().nullable().or(z.literal("")),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
  publishStatus: publishStatusSchema.default("DRAFT"),
});

export const eventSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(20000),
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
  imageUrl: optionalUrl,
  registrationUrl: optionalUrl,
  featured: z.boolean().default(false),
  publishStatus: publishStatusSchema.default("DRAFT"),
});

export const workshopSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(20000),
  instructor: z.string().min(2).max(120),
  track: z.string().min(2).max(80),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.string().max(80).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  resources: z.string().max(10000).optional().nullable(),
  registrationOpen: z.boolean().default(true),
  maxSeats: z.number().int().positive().max(10000).optional().nullable(),
  imageUrl: optionalUrl,
  order: z.number().int().default(0),
  publishStatus: publishStatusSchema.default("DRAFT"),
});

export const achievementSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10).max(20000),
  year: z.number().int().min(1900).max(2200),
  missionNumber: z.number().int().positive().optional().nullable(),
  rank: z.string().max(120).optional().nullable(),
  organization: z.string().max(200).optional().nullable(),
  imageUrl: optionalUrl,
  featured: z.boolean().default(false),
  order: z.number().int().default(0),
  publishStatus: publishStatusSchema.default("DRAFT"),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"]),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
