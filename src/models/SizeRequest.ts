import mongoose, { Schema, Document, Model } from "mongoose";
import { PRODUCT_SIZES, SIZE_REQUEST_STATUSES } from "@/constants";

export interface ISizeRequestDocument extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  requestedSize: "S" | "M" | "L" | "XL" | "XXL";
  status: "PENDING" | "FULFILLED";
  createdAt: Date;
}

const SizeRequestSchema = new Schema<ISizeRequestDocument>(
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
    requestedSize: {
      type: String,
      enum: PRODUCT_SIZES,
      required: [true, "Requested size is required"],
    },
    status: {
      type: String,
      enum: SIZE_REQUEST_STATUSES,
      default: "PENDING",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Prevent duplicate requests from the same user for the same product+size
SizeRequestSchema.index(
  { userId: 1, productId: 1, requestedSize: 1 },
  { unique: true },
);

// Admin view: all pending requests
SizeRequestSchema.index({ status: 1, createdAt: -1 });

const SizeRequest: Model<ISizeRequestDocument> =
  mongoose.models.SizeRequest ||
  mongoose.model<ISizeRequestDocument>("SizeRequest", SizeRequestSchema);

export default SizeRequest;
