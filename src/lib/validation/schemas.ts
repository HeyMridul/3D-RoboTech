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

export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

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
  publishStatus: publishStatusSchema.optional(),
  technologyIds: z.array(z.string()).optional(),
  contributorIds: z.array(z.string()).optional(),
});

export const memberSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(160).optional(),
  role: z.string().min(2).max(120),
  category: z
    .enum([
      "CORE_TEAM",
      "COORDINATOR",
      "MENTOR",
      "PROJECT_LEAD",
      "MEMBER",
      "ALUMNI",
    ])
    .optional(),
  bio: z.string().optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  skills: z.array(z.string()).optional(),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  linkedinUrl: z.string().url().optional().nullable().or(z.literal("")),
  portfolioUrl: z.string().url().optional().nullable().or(z.literal("")),
  email: z.string().email().optional().nullable().or(z.literal("")),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
  publishStatus: publishStatusSchema.optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10),
  type: z
    .enum([
      "HACKATHON",
      "WORKSHOP",
      "COMPETITION",
      "TECH_TALK",
      "EXHIBITION",
      "BOOTCAMP",
      "MEETING",
      "OTHER",
    ])
    .optional(),
  location: z.string().optional().nullable(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()).optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  registrationUrl: z.string().url().optional().nullable().or(z.literal("")),
  featured: z.boolean().optional(),
  publishStatus: publishStatusSchema.optional(),
});

export const workshopSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10),
  instructor: z.string().min(2).max(120),
  track: z.string().min(2).max(80),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  duration: z.string().optional().nullable(),
  startDate: z.string().or(z.date()).optional().nullable(),
  resources: z.string().optional().nullable(),
  registrationOpen: z.boolean().optional(),
  maxSeats: z.number().int().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  order: z.number().int().optional(),
  publishStatus: publishStatusSchema.optional(),
});

export const achievementSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  description: z.string().min(10),
  year: z.number().int(),
  missionNumber: z.number().int().optional().nullable(),
  rank: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  publishStatus: publishStatusSchema.optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).optional(),
  excerpt: z.string().optional().nullable(),
  content: z.string().min(10),
  coverImage: z.string().optional().nullable(),
  publishStatus: publishStatusSchema.optional(),
  publishedAt: z.string().or(z.date()).optional().nullable(),
});

export const galleryItemSchema = z.object({
  title: z.string().optional().nullable(),
  caption: z.string().optional().nullable(),
  imageUrl: z.string().min(1),
  projectId: z.string().optional().nullable(),
  order: z.number().int().optional(),
});

export const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.string(),
});

export const applicationStatusSchema = z.object({
  status: z.enum(["PENDING", "REVIEWING", "ACCEPTED", "REJECTED"]),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type MemberInput = z.infer<typeof memberSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type WorkshopInput = z.infer<typeof workshopSchema>;
export type AchievementInput = z.infer<typeof achievementSchema>;
