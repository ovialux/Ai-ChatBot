import { chatConfig } from "@/config/chat";
import z from "zod";

const uiMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().optional(),
  parts: z
    .array(z.object({ type: z.string(), text: z.string().optional() }))
    .optional(),
});

const requestSchema = z.object({
  messages: z
    .array(uiMessageSchema)
    .min(1, "At least one message is required")
    .max(
      chatConfig.maxMessages,
      `Cannot exceed ${chatConfig.maxMessages} messages`,
    ),
});

export type ChatRequest = z.infer<typeof requestSchema>;
export type ChatMessage = z.infer<typeof uiMessageSchema>;
export { requestSchema, uiMessageSchema };
