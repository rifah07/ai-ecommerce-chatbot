import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import User from "@/models/User";
import { seedProducts } from "@/data/products";
import { hashPassword } from "@/lib/utils/hash";

/**
 * POST /api/seed  - seeds products and admin user only.
 * Does NOT touch ChatMessage, Orders, CartItems, or SizeRequests.
 * Safe to run multiple times.
 */
export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-seed-secret");
  const expectedSecret = process.env.SEED_SECRET ?? "dev-seed-secret";

  if (process.env.NODE_ENV === "production" && secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  await connectDB();

  // Only reseed products. Never touch user data or chat history
  await Product.deleteMany({});
  const inserted = await Product.insertMany(seedProducts);

  // Create admin only if not exists
  const existingAdmin = await User.findOne({ email: "admin@shopbot.com" });
  if (!existingAdmin) {
    await User.create({
      name: "Admin User",
      email: "admin@shopbot.com",
      password: await hashPassword("Admin1234!"),
      role: "ADMIN",
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      products: inserted.length,
      adminCreated: !existingAdmin,
    },
    message: `Seeded ${inserted.length} products`,
  });
}

// GET for easy browser testing
export async function GET(request: NextRequest) {
  return POST(request);
}
