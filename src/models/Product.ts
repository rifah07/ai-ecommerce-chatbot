import mongoose, { Schema, Document, Model } from "mongoose";
import { PRODUCT_CATEGORIES, PRODUCT_SIZES } from "@/constants";

export interface IProductDocument extends Document {
  name: string;
  description: string;
  image: string;
  category: "T-Shirt" | "Pants";
  price: number;
  availableSizes: ("S" | "M" | "L" | "XL" | "XXL")[];
  stockQuantity: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    image: {
      type: String,
      required: [true, "Image URL is required"],
    },
    category: {
      type: String,
      enum: PRODUCT_CATEGORIES,
      required: [true, "Category is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    availableSizes: {
      type: [String],
      enum: PRODUCT_SIZES,
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "At least one size is required",
      },
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);

// Compound text index for full-text search (name weighted highest)
ProductSchema.index(
  { name: "text", tags: "text", description: "text" },
  { weights: { name: 10, tags: 5, description: 1 } },
);

// Index for category and size filters
ProductSchema.index({ category: 1, availableSizes: 1 });

// Index for tag queries
ProductSchema.index({ tags: 1 });

const Product: Model<IProductDocument> =
  mongoose.models.Product ||
  mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
