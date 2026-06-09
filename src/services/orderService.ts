import Order from "@/models/Order";
import CartItem from "@/models/CartItem";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";

export const orderService = {
  /**
   * Checkout entire cart.
   */
  async checkout(userId: string) {
    await connectDB();

    const cartItems = await CartItem.find({ userId })
      .populate("productId", "name price")
      .lean();

    if (cartItems.length === 0) {
      throw new AppError("BUSINESS_RULE_ERROR", "Your cart is empty");
    }

    const items = cartItems.map((item) => {
      const product = item.productId as unknown as {
        _id: string;
        name: string;
        price: number;
      };
      return {
        productId: product._id,
        name: product.name,
        price: product.price,
        size: item.size,
        quantity: item.quantity,
      };
    });

    const totalAmount =
      Math.round(
        items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100,
      ) / 100;

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      status: "PENDING",
    });

    await CartItem.deleteMany({ userId });

    return order;
  },

  /**
   * Checkout a single cart item by its _id.
   * Removes only that item from cart, rest remains.
   */
  async checkoutItem(userId: string, itemId: string) {
    await connectDB();

    const cartItem = await CartItem.findOne({ _id: itemId, userId })
      .populate("productId", "name price")
      .lean();

    if (!cartItem) {
      throw new AppError("NOT_FOUND", "Cart item not found");
    }

    const product = cartItem.productId as unknown as {
      _id: string;
      name: string;
      price: number;
    };

    const items = [
      {
        productId: product._id,
        name: product.name,
        price: product.price,
        size: cartItem.size,
        quantity: cartItem.quantity,
      },
    ];

    const totalAmount =
      Math.round(product.price * cartItem.quantity * 100) / 100;

    const order = await Order.create({
      userId,
      items,
      totalAmount,
      status: "PENDING",
    });

    // Remove only this item from cart
    await CartItem.deleteOne({ _id: itemId });

    return order;
  },

  async getUserOrders(userId: string) {
    await connectDB();
    return Order.find({ userId }).sort({ createdAt: -1 });
  },

  async getAllOrders() {
    await connectDB();
    return Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  },
};
