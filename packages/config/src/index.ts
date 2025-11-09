import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  VANNA_API_BASE_URL: z.string().url().optional(),
  GROQ_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export const constants = {
  DEFAULT_CURRENCY: "INR",
  DEFAULT_PAGE_SIZE: 50,
  MAX_QUERY_ROWS: 10000,
} as const;

