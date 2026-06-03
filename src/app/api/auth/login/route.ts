import { NextRequest } from "next/server";
import { withErrorHandler } from "@/lib/utils/AppError";
import { successResponse } from "@/lib/utils/response";
import { authService } from "@/services/authService";
import { LoginSchema } from "@/validators/authValidators";
import { setAuthCookies } from "@/lib/auth/cookies";

export const POST = withErrorHandler(async (request: NextRequest) => {
    const body = await request.json();
    const input = LoginSchema.parse(body);

    const { user, tokens } = await authService.login(input);

    setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return successResponse({ user }, "Logged in successfully");
});
