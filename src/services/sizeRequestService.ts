import SizeRequest from "@/models/SizeRequest";
import { productService } from "@/services/productService";
import { connectDB } from "@/lib/db/connect";
import type { ProductSize } from "@/types";
import type { SizeRequestTarget } from "@/types";

export const sizeRequestService = {
  /**
   * Create a size request.
   * Silently ignores duplicates (same user + product + size already requested).
   */
  async create(userId: string, productId: string, size: ProductSize) {
    await connectDB();

    try {
      await SizeRequest.create({ userId, productId, requestedSize: size });
    } catch (err: unknown) {
      // Duplicate key error (code 11000) = user already requested this - ignore
      if ((err as { code?: number }).code !== 11000) throw err;
    }
  },

  /**
   * Create a size request from a chat intent target.
   * Resolves productName → product first.
   */
  async createFromChat(userId: string, target: SizeRequestTarget) {
    await connectDB();

    if (!target.productName || !target.size) {
      return {
        message: "Please tell me the product name and size you're looking for.",
      };
    }

    const product = await productService.findByName(target.productName);
    if (!product) {
      return {
        message: `I couldn't find a product matching "${target.productName}".`,
      };
    }

    await this.create(userId, product._id.toString(), target.size);

    return {
      message: `Got it! We've recorded your request for "${product.name}" in size ${target.size}. We'll let you know when it's available.`,
    };
  },

  /**
   * Return all size requests for a specific user.
   */
  async getUserRequests(userId: string) {
    await connectDB();
    return SizeRequest.find({ userId })
      .populate("productId", "name image category")
      .sort({ createdAt: -1 });
  },

  /**
   * Return ALL size requests - admin only.
   */
  async getAllRequests() {
    await connectDB();
    return SizeRequest.find({})
      .populate("userId", "name email")
      .populate("productId", "name category")
      .sort({ createdAt: -1 });
  },
};
