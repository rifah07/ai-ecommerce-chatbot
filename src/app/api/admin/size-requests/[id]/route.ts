import { NextRequest } from "next/server";
import { withErrorHandler, AppError } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import SizeRequest from "@/models/SizeRequest";
import { connectDB } from "@/lib/db/connect";
import { z } from "zod";

const UpdateSchema = z.object({
  status: z.enum(["PENDING", "FULFILLED"]),
});

/**
 * PATCH /api/admin/size-requests/[id]
 * Admin updates a size request status: PENDING → FULFILLED
 */
export const PATCH = withErrorHandler(
  async (request: NextRequest, context?: unknown) => {
    await requireRole(request, "ADMIN");

    const { id } = await (context as { params: Promise<{ id: string }> })
      .params;
    const body = await request.json();
    const { status } = UpdateSchema.parse(body);

    await connectDB();
    const updated = await SizeRequest.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );

    if (!updated) {
      throw new AppError("NOT_FOUND", "Size request not found");
    }

    return successResponse(updated, `Status updated to ${status}`);
  },
);
