import mongoose, { Schema, Document, Model } from "mongoose";
import { PRODUCT_SIZES, ORDER_STATUSES } from "@/constants";

// Snapshot of a single product at the moment of checkout.
interface OrderItemSubdoc {
  productId: mongoose.Types.ObjectId;
  name: string; // snapshotted
  price: number; // snapshotted
  size: "S" | "M" | "L" | "XL" | "XXL";
  quantity: number;
}

export interface IOrderDocument extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItemSubdoc[];
  totalAmount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItemSubdoc>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    size: { type: String, enum: PRODUCT_SIZES, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }, // subdocuments do not need their own _id
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (v: unknown[]) => v.length > 0,
        message: "Order must have at least one item",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "PENDING",
    },
  },
  { timestamps: true },
);

// Fetch all orders for a user, newest first
OrderSchema.index({ userId: 1, createdAt: -1 });

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
