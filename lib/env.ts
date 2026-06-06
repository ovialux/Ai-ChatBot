import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
    ALLOWED_ORIGINS: z.string(),
    SHOPIFY_STORE_DOMAIN: z.string(),
    SHOPIFY_STOREFRONT_ACCESS_TOKEN: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },

  runtimeEnv: {
    GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    NODE_ENV: process.env.NODE_ENV,
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_STOREFRONT_ACCESS_TOKEN:
      process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  },
});
