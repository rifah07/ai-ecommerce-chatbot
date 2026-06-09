import CartItem from "@/models/CartItem";
import { productService } from "@/services/productService";
import { sizeRequestService } from "@/services/sizeRequestService";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";
import type { AddToCartInput } from "@/validators/cartValidators";
import type { CartTarget } from "@/types";

export const cartService = {
  /**
   * Return all cart items for a user with product data populated.
   * Also computes total price and item count.
   */
  async getCart(userId: string) {
    await connectDB();

    const items = await CartItem.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    // Rename productId → product for cleaner frontend consumption
    const mapped = items.map((item) => ({
      _id: item._id,
      size: item.size,
      quantity: item.quantity,
      createdAt: item.createdAt,
      product: item.productId, // populated
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

  /**
   * Add an item to the cart (called from the direct cart API).
   * Checks size availability first.
   * If size is unavailable → creates a SizeRequest instead.
   */
  async addItem(userId: string, input: AddToCartInput) {
    await connectDB();

    const product = await productService.findById(input.productId);

    // Size availability check
    if (!product.availableSizes.includes(input.size)) {
      await sizeRequestService.create(
        userId,
        product._id.toString(),
        input.size,
      );
      return {
        added: false,
        sizeRequested: true,
        message: `${input.size} is currently unavailable for "${product.name}". We've saved your request and will notify you when it's back in stock.`,
      };
    }

    // Upsert: if the user already has this product+size in cart, increment quantity
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

  /**
   * Add item from chat intent (uses productName string instead of productId).
   * Resolves the product by name first, then delegates to addItem.
   */
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
        message: `I couldn't find a product matching "${target.productName}". Try browsing the shop or use a different name.`,
      };
    }

    return this.addItem(userId, {
      productId: product._id.toString(),
      size: target.size,
      quantity: target.quantity ?? 1,
    });
  },

  /**
   * Remove a specific cart item by its _id.
   * Verifies the item belongs to the requesting user.
   */
  async removeItem(userId: string, itemId: string) {
    await connectDB();

    const item = await CartItem.findOne({ _id: itemId, userId });
    if (!item) {
      throw new AppError("NOT_FOUND", "Cart item not found");
    }

    await item.deleteOne();
    return { message: "Item removed from cart." };
  },

  /**
   * Remove an item from chat intent (uses productName + size).
   */
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

    const query: Record<string, unknown> = {
      userId,
      productId: product._id,
    };
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
   * Delete all cart items for a user.
   * Called internally by orderService after checkout.
   */
  async clearCart(userId: string) {
    await connectDB();
    await CartItem.deleteMany({ userId });
  },
};
