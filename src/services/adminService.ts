import Order from "@/models/Order";
import SizeRequest from "@/models/SizeRequest";
import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";

export const adminService = {
  async getAllOrders() {
    await connectDB();
    return Order.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  },

  async getAllSizeRequests() {
    await connectDB();
    return SizeRequest.find({})
      .populate("userId", "name email")
      .populate("productId", "name category image")
      .sort({ createdAt: -1 });
  },

  async getDashboardStats() {
    await connectDB();
    const [totalOrders, totalUsers, pendingSizeRequests, revenueResult] =
      await Promise.all([
        Order.countDocuments(),
        User.countDocuments({ role: "CUSTOMER" }),
        SizeRequest.countDocuments({ status: "PENDING" }),
        Order.aggregate([
          { $match: { status: { $ne: "CANCELLED" } } },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ]),
      ]);

    return {
      totalOrders,
      totalUsers,
      pendingSizeRequests,
      totalRevenue: revenueResult[0]?.total ?? 0,
    };
  },
};
