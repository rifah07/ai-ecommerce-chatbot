import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { requireRole } from "@/lib/auth/requireRole";
import { chatService } from "@/services/chatService";
import { SendMessageSchema } from "@/validators/chatValidators";

/**
 * GET /api/chat?page=1
 * Returns paginated chat history for the authenticated customer.
 */
export const GET = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const page = Number(new URL(request.url).searchParams.get("page") ?? "1");
  const history = await chatService.getHistory(user.userId, page);
  return successResponse(history);
});

/**
 * POST /api/chat
 * Body: { message: string }
*/
export const POST = withErrorHandler(async (request: NextRequest) => {
  const user = await requireRole(request, "CUSTOMER");
  const body = await request.json();
  const { message } = SendMessageSchema.parse(body);

  // Save user message
  await chatService.saveMessage(user.userId, "user", message);

  const reply = `You said: "${message}" - AI responses coming Day 7!`;

  // Save assistant reply
  const saved = await chatService.saveMessage(user.userId, "assistant", reply);

  return successResponse({
    message: reply,
    messageId: saved._id,
  });
});
