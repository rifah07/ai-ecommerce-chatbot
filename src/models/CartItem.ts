import mongoose, { Schema, Document, Model } from "mongoose";
import { PRODUCT_SIZES } from "@/constants";

export interface ICartItemDocument extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  size: "S" | "M" | "L" | "XL" | "XXL";
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema<ICartItemDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    size: {
      type: String,
      enum: PRODUCT_SIZES,
      required: [true, "Size is required"],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { timestamps: true },
);

// A user can only have one cart entry per product+size combination.
// Quantity is updated in place instead of duplicating.
CartItemSchema.index({ userId: 1, productId: 1, size: 1 }, { unique: true });

const CartItem: Model<ICartItemDocument> =
  mongoose.models.CartItem ||
  mongoose.model<ICartItemDocument>("CartItem", CartItemSchema);

export default CartItem;
