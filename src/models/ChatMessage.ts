import mongoose, { Schema, Document, Model } from "mongoose";
import { MESSAGE_ROLES } from "@/constants";

// One document per message
// Enables native pagination and efficient per-message queries.
// Index: { userId, timestamp } - all messages for a user, chronological.
export interface IChatMessageDocument extends Document {
  userId: mongoose.Types.ObjectId;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: MESSAGE_ROLES,
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
    },
    timestamp: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: false },
);

// Core query: all messages for a user, oldest→newest
ChatMessageSchema.index({ userId: 1, timestamp: 1 });

const ChatMessage: Model<IChatMessageDocument> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessageDocument>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
