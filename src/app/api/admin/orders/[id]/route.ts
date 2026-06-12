import { NextRequest } from "next/server";
import { withErrorHandler, AppError } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import Order from "@/models/Order";
import { connectDB } from "@/lib/db/connect";
import { z } from "zod";

const UpdateOrderSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"]),
});

export const PATCH = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    await requireRole(request, "ADMIN");

    const { id } = await (context as { params: Promise<{ id: string }> })
      .params;
    const body = await request.json();
    const { status } = UpdateOrderSchema.parse(body);

    await connectDB();
    const updated = await Order.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    ).populate("userId", "name email");

    if (!updated) {
      throw new AppError("NOT_FOUND", "Order not found");
    }

    return successResponse(updated, `Order status updated to ${status}`);
  },
);
