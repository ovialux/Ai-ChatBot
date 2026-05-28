import { chatConfig } from "@/config/chat";
import z from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  // support both UIMessage (parts) and plain (content) shapes
  parts: z
    .array(z.object({ type: z.string(), text: z.string().optional() }))
    .optional(),
  content: z.string().optional(),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(chatConfig.maxMessages),
});

export type ChatRequest = z.infer<typeof requestSchema>;
export type ChatMessage = z.infer<typeof messageSchema>;
export { requestSchema, messageSchema };
