import { env } from "./env";

export const corsHeaders = {
  "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export function OPTIONS(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}
