import CartItem from "@/models/CartItem";
import { productService } from "@/services/productService";
import { sizeRequestService } from "@/services/sizeRequestService";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";
import type { AddToCartInput } from "@/validators/cartValidators";
import type { CartTarget } from "@/types";

export const cartService = {
  async getCart(userId: string) {
    await connectDB();
    const items = await CartItem.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    const mapped = items.map((item) => ({
      _id: item._id.toString(),
      size: item.size,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: item.productId,
    }));

    const total = mapped.reduce((sum, item) => {
      const price = (item.product as { price?: number })?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);

    return {
      items: mapped,
      total: Math.round(total * 100) / 100,
      itemCount: mapped.reduce((sum, item) => sum + item.quantity, 0),
    };
  },

  async addItem(userId: string, input: AddToCartInput) {
    await connectDB();
    const product = await productService.findById(input.productId);

    if (!product.availableSizes.includes(input.size)) {
      await sizeRequestService.create(
        userId,
        product._id.toString(),
        input.size,
      );
      return {
        added: false,
        sizeRequested: true,
        message: `${input.size} is currently unavailable for "${product.name}". We've saved your request!`,
      };
    }

    await CartItem.findOneAndUpdate(
      { userId, productId: input.productId, size: input.size },
      { $inc: { quantity: input.quantity } },
      { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
    );

    return {
      added: true,
      sizeRequested: false,
      message: `${input.quantity}x "${product.name}" (${input.size}) added to your cart.`,
    };
  },

  async addItemFromChat(userId: string, target: CartTarget) {
    await connectDB();

    if (!target.productName) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Please tell me which product you want to add.",
      );
    }
    if (!target.size) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Please specify a size (S, M, L, XL, or XXL).",
      );
    }

    const product = await productService.findByName(target.productName);
    if (!product) {
      return {
        added: false,
        message: `I couldn't find a product matching "${target.productName}". Try browsing the shop.`,
      };
    }

    return this.addItem(userId, {
      productId: product._id.toString(),
      size: target.size,
      quantity: target.quantity ?? 1,
    });
  },

  /**
   * Update quantity of a specific cart item.
   * If quantity <= 0, removes the item entirely.
   */
  async updateQuantity(userId: string, itemId: string, quantity: number) {
    await connectDB();

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    const item = await CartItem.findOneAndUpdate(
      { _id: itemId, userId },
      { quantity },
      { returnDocument: "after" },
    );

    if (!item) throw new AppError("NOT_FOUND", "Cart item not found");

    return { message: `Quantity updated to ${quantity}.` };
  },

  async removeItem(userId: string, itemId: string) {
    await connectDB();
    const item = await CartItem.findOne({ _id: itemId, userId });
    if (!item) throw new AppError("NOT_FOUND", "Cart item not found");
    await item.deleteOne();
    return { message: "Item removed from cart." };
  },

  async removeItemFromChat(userId: string, target: CartTarget) {
    await connectDB();

    if (!target.productName) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Please tell me which product to remove.",
      );
    }

    const product = await productService.findByName(target.productName);
    if (!product) {
      return {
        message: `I couldn't find "${target.productName}" in your cart.`,
      };
    }

    const query: Record<string, unknown> = { userId, productId: product._id };
    if (target.size) query.size = target.size;

    const item = await CartItem.findOne(query);
    if (!item) {
      return {
        message: `"${product.name}"${target.size ? ` (${target.size})` : ""} is not in your cart.`,
      };
    }

    await item.deleteOne();
    return {
      message: `"${product.name}" (${item.size}) removed from your cart.`,
    };
  },

  /**
   * Update quantity from chat intent.
   * "change shirt quantity to 2" → sets quantity to 2, does not remove
   */
  async updateQuantityFromChat(userId: string, target: CartTarget) {
    await connectDB();

    if (!target.productName) {
      return { message: "Which product quantity would you like to change?" };
    }

    const product = await productService.findByName(target.productName);
    if (!product) {
      return {
        message: `I couldn't find "${target.productName}" in your cart.`,
      };
    }

    const query: Record<string, unknown> = { userId, productId: product._id };
    if (target.size) query.size = target.size;

    const item = await CartItem.findOne(query);
    if (!item) {
      return { message: `"${product.name}" is not in your cart.` };
    }

    const newQty = target.quantity ?? 1;

    if (newQty <= 0) {
      await item.deleteOne();
      return { message: `"${product.name}" removed from your cart.` };
    }

    await CartItem.findByIdAndUpdate(item._id, { quantity: newQty });
    return {
      message: `"${product.name}" (${item.size}) quantity updated to ${newQty}.`,
    };
  },

  async clearCart(userId: string) {
    await connectDB();
    await CartItem.deleteMany({ userId });
  },
};
