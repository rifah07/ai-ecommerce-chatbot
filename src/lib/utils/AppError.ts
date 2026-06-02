import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export type ErrorCode =
  | "UNAUTHORIZED"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "BUSINESS_RULE_ERROR"
  | "INTERNAL_ERROR";

const HTTP_STATUS: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  VALIDATION_ERROR: 422,
  NOT_FOUND: 404,
  BUSINESS_RULE_ERROR: 409,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);

    Object.setPrototypeOf(this, AppError.prototype);

    this.code = code;
    this.statusCode = HTTP_STATUS[code];
    this.name = "AppError";
  }
}

type RouteHandler<TContext = unknown> = (
  req: NextRequest,
  context?: TContext,
) => Promise<Response>;

export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: error.code,
              message: error.message,
            },
          },
          {
            status: error.statusCode,
          },
        );
      }

      if (error instanceof ZodError) {
        const details = error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`,
        );

        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Validation failed",
              details,
            },
          },
          {
            status: 422,
          },
        );
      }

      console.error("[API Error]", error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        },
        {
          status: 500,
        },
      );
    }
  };
}
