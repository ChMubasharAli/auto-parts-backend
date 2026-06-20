import { z } from "zod";

export const updateShopStatusSchema = z.object({
  shopStatus: z.enum(["Open", "Closed"]),
  maintenanceMessage: z.string().max(200).optional(),
});
