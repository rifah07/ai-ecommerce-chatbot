export const PRODUCT_SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const PRODUCT_CATEGORIES = ["T-Shirt", "Pants"] as const;
export const USER_ROLES = ["CUSTOMER", "ADMIN"] as const;

export const INTENTS = [
  "BROWSE_PRODUCTS",
  "ADD_TO_CART",
  "REMOVE_FROM_CART",
  "VIEW_CART",
  "CHECKOUT",
  "REQUEST_SIZE",
  "UNKNOWN",
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const SIZE_REQUEST_STATUSES = ["PENDING", "FULFILLED"] as const;

export const MESSAGE_ROLES = ["user", "assistant"] as const;

// Cookie names - single source of truth
export const COOKIE_ACCESS_TOKEN = "accessToken";
export const COOKIE_REFRESH_TOKEN = "refreshToken";

export const DEFAULT_PAGE_LIMIT = 50;
export const CHAT_CONTEXT_LIMIT = 10;
