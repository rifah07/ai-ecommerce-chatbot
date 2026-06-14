// FILE: src/services/chatService.ts

import mongoose from "mongoose";
import ChatMessage from "@/models/ChatMessage";
import { connectDB } from "@/lib/db/connect";
import type { MessageRole } from "@/types";

export const chatService = {
  async saveMessage(userId: string, role: MessageRole, content: string) {
    await connectDB();
    return ChatMessage.create({
      userId: new mongoose.Types.ObjectId(userId),
      role,
      content,
      timestamp: new Date(),
    });
  },

  async getHistory(userId: string, page = 1, limit = 50) {
    await connectDB();
    const skip = (page - 1) * limit;

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [messages, total] = await Promise.all([
      ChatMessage.find({ userId: userObjectId })
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit),
      ChatMessage.countDocuments({ userId: userObjectId }),
    ]);

    return {
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  // Truncate long assistant messages so Gemini context stays small.
  // Product list replies can be 2000+ chars — we only need the intent label,
  // not the full product JSON, for Gemini to understand the conversation flow.
  async getRecentMessages(userId: string, limit = 6) {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const messages = await ChatMessage.find({ userId: userObjectId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return messages.reverse().map((m) => ({
      role: m.role,
      // Truncate assistant messages to 120 chars max for Gemini context
      // User messages are kept full so Gemini understands the latest intent
      content:
        m.role === "assistant" && m.content.length > 120
          ? m.content.slice(0, 120) + "…"
          : m.content,
    }));
  },
};
