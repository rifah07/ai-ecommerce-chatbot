import Product from "@/models/Product";
import { connectDB } from "@/lib/db/connect";
import { AppError } from "@/lib/utils/AppError";
import type { ProductFilters } from "@/validators/productValidators";

export const productService = {
  /**
   * Return products matching optional filters.
   * Supports: category, size, tag, free-text search.
   */
  async getProducts(filters: ProductFilters = {}) {
    await connectDB();

    const query: Record<string, unknown> = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.size) {
      query.availableSizes = { $in: [filters.size] };
    }

    if (filters.tag) {
      query.tags = { $in: [filters.tag.toLowerCase()] };
    }

    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    const products = await Product.find(query)
      .select("-__v")
      .sort(
        filters.search
          ? { score: { $meta: "textScore" } } // relevance order for search
          : { createdAt: -1 }, // newest first otherwise
      )
      .limit(60);

    return products;
  },

  // Find a single product by its MongoDB _id.

  async findById(id: string) {
    await connectDB();
    const product = await Product.findById(id).select("-__v");
    if (!product) {
      throw new AppError("NOT_FOUND", "Product not found");
    }
    return product;
  },

  /**
   * Find the best matching product by a name string.
   * Used by the chat service when Gemini extracts a productName.
   * Falls back to a partial name match if text search returns nothing.
   */
  async findByName(name: string) {
    await connectDB();

    // Try text search first (uses index weights: name=10, tags=5, description=1)
    let product = await Product.findOne(
      { $text: { $search: name } },
      { score: { $meta: "textScore" } },
    ).sort({ score: { $meta: "textScore" } });

    // Fallback: case-insensitive partial match on name
    if (!product) {
      product = await Product.findOne({
        name: { $regex: name, $options: "i" },
      });
    }

    return product; // null if truly not found
  },

  /**
   * Return all unique tags across the product catalog.
   * Used to populate the FilterBar tag dropdown.
   */
  async getAllTags(): Promise<string[]> {
    await connectDB();
    const result = await Product.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags" } },
      { $sort: { _id: 1 } },
    ]);
    return result.map((r) => r._id as string);
  },
};
