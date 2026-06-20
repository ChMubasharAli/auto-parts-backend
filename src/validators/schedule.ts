import { z } from "zod";

export const updateScheduleSchema = z
  .object({
    isOpen: z.boolean(),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
  })
  .refine(
    (data) => {
      if (!data.isOpen) return true;
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const createBlockedSlotSchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
    startTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
    endTime: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:mm)",
      ),
    reason: z.string().max(200).optional(),
  })
  .refine(
    (data) => {
      const [startHour, startMin] = data.startTime.split(":").map(Number);
      const [endHour, endMin] = data.endTime.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      return endMinutes > startMinutes;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const createDayOffSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  reason: z.string().max(200).optional(),
});

// ZOD V4 COMPATIBLE - accepts number or string
export const updateSlotIntervalSchema = z.object({
  slotInterval: z.union([
    z
      .number()
      .int()
      .min(15)
      .max(120)
      .refine((v) => [15, 30, 45, 60].includes(v), {
        message: "Slot interval must be 15, 30, 45, or 60 minutes",
      }),
    z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(
        z
          .number()
          .int()
          .min(15)
          .max(120)
          .refine((v) => [15, 30, 45, 60].includes(v), {
            message: "Slot interval must be 15, 30, 45, or 60 minutes",
          }),
      ),
  ]),
});
