import Order from "@/models/Order";
import CartItem from "@/models/CartItem";
import { cartService } from "@/services/cartService";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";

export const orderService = {
  async checkout(userId: string) {
    await connectDB();

    // Fetch cart items with product populated directly from DB for accuracy at checkout time
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

    // Clear cart after order created
    await cartService.clearCart(userId);

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
