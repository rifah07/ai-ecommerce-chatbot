import mongoose, { Schema, Document, Model } from "mongoose";
import { USER_ROLES } from "@/constants";

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "CUSTOMER",
    },
  },
  { timestamps: true },
);

UserSchema.set("toJSON", {
  transform(_doc, ret) {
    const { password, ...safeUser } = ret;
    return safeUser;
  },
});

const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);

export default User;
