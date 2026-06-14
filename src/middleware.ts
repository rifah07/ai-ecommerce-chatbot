// This file ensures cookies are properly handled across all Vercel regions.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Pass through — just ensures Next.js middleware runs
  // which fixes cookie propagation across Vercel edge regions
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes so cookies are always forwarded
    "/api/:path*",
  ],
};
