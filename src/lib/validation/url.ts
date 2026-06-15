import { z } from "zod";
import { slugSchema } from "@/lib/validation/slug";

export const createUrlSchema = z.object({
  longUrl: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine(
      (val) => {
        try {
          const url = new URL(val);
          return url.protocol === "http:" || url.protocol === "https:";
        } catch {
          return false;
        }
      },
      { message: "Must be a valid http or https URL" },
    ),
  slug: slugSchema.optional(),
});

export type CreateUrlInput = z.infer<typeof createUrlSchema>;
