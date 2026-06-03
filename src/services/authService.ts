import User from "@/models/User";
import { connectDB } from "@/lib/db/connect";
import { hashPassword, comparePassword } from "@/lib/utils/hash";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/lib/auth/jwt";
import { AppError } from "@/lib/utils/AppError";
import type { RegisterInput, LoginInput } from "@/validators/authValidators";
import type { IUser } from "@/types";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: IUser;
  tokens: AuthTokens;
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    await connectDB();

    const existing = await User.findOne({ email: input.email });
    if (existing) {
      throw new AppError(
        "BUSINESS_RULE_ERROR",
        "An account with this email already exists",
      );
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await User.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    return { user: user.toJSON() as unknown as IUser, tokens };
  },

  async login(input: LoginInput): Promise<AuthResult> {
    await connectDB();

    const user = await User.findOne({ email: input.email }).select("+password");
    if (!user) {
      throw new AppError("UNAUTHORIZED", "Invalid email or password");
    }

    const valid = await comparePassword(input.password, user.password);
    if (!valid) {
      throw new AppError("UNAUTHORIZED", "Invalid email or password");
    }

    const tokens = generateTokens(user._id.toString(), user.email, user.role);

    return { user: user.toJSON() as unknown as IUser, tokens };
  },

  //Issue a new access token using a valid refresh token.

  async refresh(
    refreshToken: string | undefined,
  ): Promise<{ accessToken: string }> {
    if (!refreshToken) {
      throw new AppError("UNAUTHORIZED", "Refresh token missing");
    }

    const payload = verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AppError("UNAUTHORIZED", "Invalid or expired refresh token");
    }

    await connectDB();
    const user = await User.findById(payload.userId);
    if (!user) {
      throw new AppError("UNAUTHORIZED", "User no longer exists");
    }

    const accessToken = signAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return { accessToken };
  },

  async getMe(userId: string): Promise<IUser> {
    await connectDB();
    const user = await User.findById(userId).select("-password");
    if (!user) {
      throw new AppError("NOT_FOUND", "User not found");
    }
    return user.toJSON() as unknown as IUser;
  },
};

function generateTokens(
  userId: string,
  email: string,
  role: "CUSTOMER" | "ADMIN",
): AuthTokens {
  return {
    accessToken: signAccessToken({ userId, email, role }),
    refreshToken: signRefreshToken(userId),
  };
}
