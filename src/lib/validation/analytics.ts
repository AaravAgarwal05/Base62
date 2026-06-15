import { z } from "zod";

export const analyticsEventSchema = z.object({
  urlId: z.number().positive(),
  type: z.enum(["click", "scan"]),
  timestamp: z.string().datetime().optional(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventSchema>;
