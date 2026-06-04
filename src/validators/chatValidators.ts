import { z } from "zod";

export const SendMessageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, { message: "Message is required" })
    .max(500, { message: "Message cannot exceed 500 characters" }),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;
