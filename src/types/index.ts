export type UserRole = "CUSTOMER" | "ADMIN";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductCategory = "T-Shirt" | "Pants";
export type ProductSize = "S" | "M" | "L" | "XL" | "XXL";

export interface IProduct {
  _id: string;
  name: string;
  description: string;
  image: string;
  category: ProductCategory;
  price: number;
  availableSizes: ProductSize[];
  stockQuantity: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICartItem {
  _id: string;
  userId: string;
  productId: string;
  product?: IProduct; // populated
  size: ProductSize;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICart {
  items: ICartItem[];
  total: number;
  itemCount: number;
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  size: ProductSize;
  quantity: number;
}

export interface IOrder {
  _id: string;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type MessageRole = "user" | "assistant";

export interface IChatMessage {
  _id: string;
  userId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ChatPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IChatHistory {
  messages: IChatMessage[];
  pagination: ChatPagination;
}

export type SizeRequestStatus = "PENDING" | "FULFILLED";

export interface ISizeRequest {
  _id: string;
  userId: string;
  productId: string;
  product?: IProduct; // populated
  requestedSize: ProductSize;
  status: SizeRequestStatus;
  createdAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export type IntentType =
  | "BROWSE_PRODUCTS"
  | "ADD_TO_CART"
  | "REMOVE_FROM_CART"
  | "VIEW_CART"
  | "CHECKOUT"
  | "REQUEST_SIZE"
  | "UNKNOWN";

export type IntentConfidence = "high" | "medium" | "low";

export interface BrowseFilters {
  category?: ProductCategory;
  size?: ProductSize;
  tag?: string;
  search?: string;
}

export interface CartTarget {
  productName?: string;
  size?: ProductSize;
  quantity?: number;
}

export interface SizeRequestTarget {
  productName?: string;
  size?: ProductSize;
}

export interface IDashboardStats {
  totalOrders: number;
  totalUsers: number;
  pendingSizeRequests: number;
  totalRevenue: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string[];
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
