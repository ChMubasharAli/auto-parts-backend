import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100),
  duration: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 minute")
    .max(480, "Duration cannot exceed 8 hours"),
  price: z.number().min(0, "Price cannot be negative"),
  isActive: z.boolean().default(true),
});

export const updateServiceSchema = z.object({
  name: z.string().min(1, "Service name is required").max(100).optional(),
  duration: z.number().int().min(1).max(480).optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});
