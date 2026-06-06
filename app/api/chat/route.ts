import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { errorResponse, getClientIp } from "@/lib/utils";
import { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { requestSchema } from "@/schema";
import { getProducts } from "@/lib/shopify";
import { buildSystemPrompt } from "@/lib/system-prompt";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (isRateLimited(ip)) {
    return errorResponse(
      "Too many requests. Please wait a moment and try again.",
      429,
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body.", 400);
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("Invalid request format.", 400);
  }

  try {
    const products = await getProducts();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: buildSystemPrompt(products),
      messages: await convertToModelMessages(
        parsed.data.messages as Parameters<typeof convertToModelMessages>[0],
      ),
      maxOutputTokens: 600,
      // ✅ hard timeout — if Gemini hangs, fail after 15s
      abortSignal: AbortSignal.timeout(15_000),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[chat/route] streamText error:", err);
    return errorResponse(
      "Assistant temporarily unavailable. Please contact support.",
      500,
    );
  }
}
