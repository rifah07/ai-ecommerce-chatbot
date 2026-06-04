import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Product from "@/models/Product";
import User from "@/models/User";
import { seedProducts } from "@/data/products";
import { hashPassword } from "@/lib/utils/hash";

/**
 * POST /api/seed
 *
 * One-time dev endpoint to populate the database.
 * Protected by a SEED_SECRET env variable so it cannot be
 * accidentally called in production.
 *
 * Usage:
 *   curl -X POST http://localhost:3000/api/seed \
 *        -H "x-seed-secret: your_seed_secret"
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

  //Seed products
  await Product.deleteMany({});
  const insertedProducts = await Product.insertMany(seedProducts);

  // Seed admin user
  // Credentials: admin@shopbot.com / Admin1234!
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
      products: insertedProducts.length,
      adminCreated: !existingAdmin,
      adminCredentials: {
        email: "admin@shopbot.com",
        password: "Admin1234!",
      },
    },
    message: `Seeded ${insertedProducts.length} products and admin user`,
  });
}
