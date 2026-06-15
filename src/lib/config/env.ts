import { z } from "zod";

/* ─── Schema ─── */
const envSchema = z.object({
  // Required
  NEXT_PUBLIC_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
  SERVER_ID: z.string().min(1),
  COUNTER_START: z.string().min(1),
  COUNTER_END: z.string().min(1),

  // Optional
  REDIS_URL: z.string().optional(),
  QSTASH_TOKEN: z.string().optional(),
  QSTASH_URL: z.string().optional(),
  QSTASH_CURRENT_SIGNING_KEY: z.string().optional(),
  QSTASH_NEXT_SIGNING_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/* ─── Validated singleton ─── */
let _env: Env | null = null;

export function getEnv(): Env {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const flat = result.error.flatten();
    console.error("❌ Invalid/missing environment variables:");
    for (const [key, errors] of Object.entries(flat.fieldErrors)) {
      console.error(`   ${key}: ${errors.join(", ")}`);
    }
    if (flat.formErrors.length) {
      console.error(`   form: ${flat.formErrors.join(", ")}`);
    }
    throw new Error("Environment validation failed — see errors above");
  }

  _env = result.data;
  return _env;
}
