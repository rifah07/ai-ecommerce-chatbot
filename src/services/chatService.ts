import ChatMessage from "@/models/ChatMessage";
import { connectDB } from "@/lib/db/connect";
import type { MessageRole } from "@/types";

export const chatService = {
  async saveMessage(userId: string, role: MessageRole, content: string) {
    await connectDB();
    return ChatMessage.create({ userId, role, content, timestamp: new Date() });
  },

  // Paginated history — used by GET /api/chat
  async getHistory(userId: string, page = 1, limit = 50) {
    await connectDB();
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ChatMessage.find({ userId })
        .sort({ timestamp: 1 })
        .skip(skip)
        .limit(limit),
      ChatMessage.countDocuments({ userId }),
    ]);

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Last N messages passed to Gemini as conversation context
  async getRecentMessages(userId: string, limit = 10) {
    await connectDB();
    const messages = await ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit);
    return messages.reverse(); // oldest → newest for the prompt
  },
};
