import { z } from "zod";

export const createBookingSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(1, "Phone is required").max(20),
    vehicleMake: z.string().min(1, "Vehicle make is required").max(50),
    vehicleModel: z.string().min(1, "Vehicle model is required").max(50),
    vehicleYear: z
      .number()
      .int()
      .min(1900)
      .max(new Date().getFullYear() + 1),
  }),
  appointmentDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
  serviceIds: z
    .array(z.string().min(1))
    .min(1, "At least one service is required"),
  notes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  cancelReason: z.string().min(1, "Cancellation reason is required").max(500),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["Pending", "Confirmed", "Cancelled", "Completed"]),
});
