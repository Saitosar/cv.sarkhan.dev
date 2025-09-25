// src/lib/validators.ts
import { z } from 'zod';

export const resumeSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters." }),
  jobTitle: z.string().min(2, { message: "Job title must be at least 2 characters." }),
  // Добавь остальные поля по аналогии с UI Kit
});