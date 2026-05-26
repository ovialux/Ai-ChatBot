import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";
import { errorResponse, getClientIp } from "@/lib/utils";
import { NextRequest } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { requestSchema } from "@/schema";
import { getProducts } from "@/lib/shopify";
import { buildSystemPrompt } from "@/lib/system-prompt";
import { corsHeaders } from "@/lib/cors";
import { chatConfig } from "@/config/chat";

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
    const issues = parsed.error.flatten().fieldErrors;
    return errorResponse(JSON.stringify(issues), 400);
  }

  const coreMessages = await convertToModelMessages(
    parsed.data.messages as Parameters<typeof convertToModelMessages>[0],
  );

  // 5. Enforce per-message length after normalization
  for (const msg of coreMessages) {
    const text =
      typeof msg.content === "string"
        ? msg.content
        : JSON.stringify(msg.content);
    if (text.length > chatConfig.maxMessageLength) {
      return errorResponse(
        `Message exceeds ${chatConfig.maxMessageLength} character limit.`,
        400,
      );
    }
  }

  // 6. Fetch Shopify products (fails gracefully)
  const products = await getProducts();
  const systemPrompt = buildSystemPrompt(products);

  // 7. Stream from Gemini
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: coreMessages,
      maxOutputTokens: 300,
    });

    return result.toUIMessageStreamResponse({ headers: corsHeaders });
  } catch (err) {
    console.error("[chat/route] streamText error:", err);
    return errorResponse(
      "Assistant temporarily unavailable. Please contact support.",
      500,
    );
  }
}
// const result = await streamText({
