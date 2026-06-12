import Order from "@/models/Order";
import CartItem from "@/models/CartItem";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";

export const orderService = {
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

  async checkoutItem(userId: string, itemId: string) {
    await connectDB();

    const cartItem = await CartItem.findOne({ _id: itemId, userId })
      .populate("productId", "name price")
      .lean();

    if (!cartItem) throw new AppError("NOT_FOUND", "Cart item not found");

    const product = cartItem.productId as unknown as {
      _id: string;
      name: string;
      price: number;
    };

    const totalAmount =
      Math.round(product.price * cartItem.quantity * 100) / 100;

    const order = await Order.create({
      userId,
      items: [
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          size: cartItem.size,
          quantity: cartItem.quantity,
        },
      ],
      totalAmount,
      status: "PENDING",
    });

    await CartItem.deleteOne({ _id: itemId });
    return order;
  },

  async checkoutItemByName(userId: string, productName: string, size?: string) {
    await connectDB();

    const { productService } = await import("@/services/productService");
    const product = await productService.findByName(productName);
    if (!product) {
      throw new AppError(
        "NOT_FOUND",
        `Product "${productName}" not found in your cart`,
      );
    }

    const query: Record<string, unknown> = { userId, productId: product._id };
    if (size) query.size = size;

    const cartItem = await CartItem.findOne(query)
      .populate("productId", "name price")
      .lean();
    if (!cartItem) {
      throw new AppError("NOT_FOUND", `"${product.name}" is not in your cart`);
    }

    return this.checkoutItem(userId, cartItem._id.toString());
  },

  /**
   * Cancel an order.
   * Only PENDING or CONFIRMED orders can be cancelled.
   * Returns the cancelled order with the amount for revenue deduction.
   */
  async cancelOrder(userId: string, orderId?: string) {
    await connectDB();

    // If no orderId, cancel the most recent cancellable order
    const query: Record<string, unknown> = {
      userId,
      status: { $in: ["PENDING", "CONFIRMED"] },
    };
    if (orderId) query._id = orderId;

    const order = await Order.findOne(query).sort({ createdAt: -1 });

    if (!order) {
      throw new AppError(
        "NOT_FOUND",
        orderId
          ? "Order not found or cannot be cancelled"
          : "No cancellable orders found. Only PENDING or CONFIRMED orders can be cancelled.",
      );
    }

    order.status = "CANCELLED";
    await order.save();

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
