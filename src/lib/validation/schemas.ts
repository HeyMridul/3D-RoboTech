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

export type ApplicationInput = z.infer<typeof applicationSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
