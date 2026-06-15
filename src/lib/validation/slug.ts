import { z } from "zod";
import { RESERVED_SLUGS } from "@/constants/reserved-slugs";

export const slugSchema = z
  .string()
  .trim()
  .min(6, "Slug must be at least 6 characters")
  .max(32, "Slug must be at most 32 characters")
  .regex(
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/,
    "Slug can only contain letters, numbers, and hyphens; cannot start or end with a hyphen",
  )
  .refine(
    (s) => !RESERVED_SLUGS.has(s.toLowerCase()),
    { message: "This slug is reserved" },
  );

export type SlugInput = z.infer<typeof slugSchema>;
