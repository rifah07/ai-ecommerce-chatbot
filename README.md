# ShopBot — AI-Powered E-Commerce Chatbot

A full-stack conversational e-commerce application where users browse products, manage their cart, and complete checkout entirely through natural language chat — built with Next.js 15, MongoDB Atlas, and Google Gemini AI.

---

## Live Demo

> **Live URL:** https://ai-ecommerce-chatbot-six.vercel.app/shop
> **GitHub:** [ai-ecommerce-chatbot](https://github.com/rifah07/ai-ecommerce-chatbot.git)

### Test Accounts

| Role     | Email                   | Password    |
| -------- | ----------------------- | ----------- |
| Customer | Register at `/register` | Your choice |
| Admin    | admin@shopbot.com       | Admin1234!  |

---

## Tech Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Frontend       | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui             |
| Backend        | Next.js API Routes — NestJS-inspired controller/service pattern          |
| Database       | MongoDB Atlas + Mongoose                                                 |
| Authentication | Custom JWT — Access Token (15m) + Refresh Token (7d) + HTTP-only Cookies |
| AI             | Google Gemini 2.5 Flash — intent extraction only                         |
| Deployment     | Vercel                                                                   |

---

## Core Architecture

```
User Message → Gemini (Intent Extraction) → Zod Validation → Service Layer → MongoDB → Response
```

**The AI never executes business logic.** Gemini only extracts intent and entities from natural language. All business logic lives in the service layer — making the system predictable, testable, and safe from hallucination side effects.

### Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, Register
│   ├── (shop)/             # Shop, Cart, Chat, Orders, Demo
│   ├── (admin)/            # Admin Dashboard, Orders, Size Requests
│   └── api/                # REST API — controllers only, no business logic
├── models/                 # Mongoose schemas with indexes
├── services/               # All business logic (authService, cartService, etc.)
├── validators/             # Zod schemas — user input + AI output validation
├── constants/              # Shared enums (sizes, categories, roles, intents)
├── types/                  # Shared TypeScript interfaces
├── data/                   # Seed data — 30 products with tags
├── hooks/                  # React hooks (useAuth, useCart, useChat)
├── components/             # UI components
└── lib/                    # Infrastructure only
    ├── db/                 # MongoDB connection singleton
    ├── auth/               # JWT, cookies, requireAuth, requireRole
    ├── gemini/             # Gemini client + extractIntent()
    └── utils/              # AppError, response helpers, bcrypt
```

---

## Features

### Customer Features

#### Product Catalog

- 30 products — 15 T-Shirts + 15 Pants with realistic images (Unsplash)
- Filter by category, size, tag, or free-text search
- MongoDB text index with weighted relevance scoring (name > tags > description)
- Product cards showing available sizes, tags, and price

#### AI Chatbot — Supported Intents

| Intent             | Example Message                      | What Happens                              |
| ------------------ | ------------------------------------ | ----------------------------------------- |
| `BROWSE_PRODUCTS`  | "Show me running t-shirts in size L" | Returns product cards inline in chat      |
| `ADD_TO_CART`      | "Add slim chino in M to my cart"     | Adds item, checks size availability first |
| `REMOVE_FROM_CART` | "Remove the polo from my cart"       | Removes item by name                      |
| `UPDATE_QUANTITY`  | "Change polo quantity to 2"          | Updates quantity without removing         |
| `VIEW_CART`        | "What is in my cart?"                | Shows cart summary with totals            |
| `CHECKOUT`         | "Checkout"                           | Places order for entire cart              |
| `CHECKOUT_ITEM`    | "Checkout only the slim chino"       | Places order for one specific item        |
| `CANCEL_ORDER`     | "Cancel my order"                    | Cancels most recent cancellable order     |
| `REQUEST_SIZE`     | "I want Nike tee in XXL"             | Creates size request automatically        |
| `UNKNOWN`          | "What is the weather?"               | Helpful fallback with suggestions         |

#### Size Request Feature

When a requested size is unavailable, instead of returning an error, the system automatically creates a `SizeRequest` document and informs the user their request has been recorded. This turns a failure state into a CRM feature.

#### Cart

- Add items directly from the product grid (inline size picker)
- Remove individual items
- Update quantity per item
- Checkout entire cart or a single specific item
- All cart actions also available through chat

#### Orders

- Full order history with status badges
- Cancel PENDING or CONFIRMED orders directly from the orders page
- Order cancellation also available through chat

#### Chat

- Persistent chat history linked to user account
- Product cards render inline when bot shows products
- Cart summary card renders when viewing cart
- Order confirmation card renders after checkout
- Suggestion chips on empty chat state
- Typing indicator while AI processes

### Admin Features

- **Dashboard** — total orders (excluding cancelled), customer count, total revenue (excluding cancelled), pending size requests
- **Orders table** — all orders with customer info, dropdown to update status (PENDING → CONFIRMED → SHIPPED → DELIVERED → CANCELLED)
- **Size requests table** — all requests with product image, toggle PENDING ↔ FULFILLED

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/rifah07/ai-ecommerce-chatbot.git
cd ai-ecommerce-chatbot
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
MONGODB_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
GEMINI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run development server

```bash
npm run dev
```

### 4. Seed the database

```bash
curl -X POST http://localhost:3000/api/seed
```

Creates 30 products and one admin account (`admin@shopbot.com` / `Admin1234!`).
Safe to run multiple times — does not delete chat history or orders.

### 5. Open the app

```
http://localhost:3000       → redirects to /shop
http://localhost:3000/demo  → chat guide with example messages
```

---

## Challenges & Solutions

### 1. Next.js 15 Cookie Handling

**Challenge:** Auth cookies were not being set after login. DevTools showed no `accessToken` or `refreshToken` cookies despite the login endpoint returning 200.

**Root cause:** `cookies()` from `next/headers` is unreliable when called inside helper functions from Route Handlers in Next.js 15. Additionally, `sameSite: "strict"` was blocking cookies on the first request after a redirect.

**Solution:** Set cookies directly on the `NextResponse` object using `response.cookies.set()`. Changed `sameSite` from `"strict"` to `"lax"`. Added `router.refresh()` after `router.push()` to re-mount client components including the Navbar.

---

### 2. Next.js 15 Async Params

**Challenge:** `Error: Route "/api/cart/[itemId]" used params.itemId. params is a Promise and must be unwrapped with await.`

**Root cause:** Next.js 15 changed dynamic route segment params from a plain object to a Promise.

**Solution:**

```typescript
// Before (Next.js 14)
const { itemId } = context.params;

// After (Next.js 15)
const { itemId } = await (context as { params: Promise<{ itemId: string }> })
  .params;
```

---

### 3. React Cascading setState Warning

**Challenge:** Multiple hooks (`useAuth`, `useCart`, `useChat`, `ProductGrid`) triggered `Error: Calling setState synchronously within an effect can trigger cascading renders`.

**Root cause:** Using `useCallback` to create async functions that called `setState`, then passing those as `useEffect` dependencies.

**Solution:** Define an `async function load()` inline inside `useEffect` with a `cancelled` flag to prevent stale updates:

```typescript
useEffect(() => {
  let cancelled = false;
  async function load() {
    // fetch data
    if (!cancelled) setState(data);
  }
  load();
  return () => {
    cancelled = true;
  };
}, [dependency]);
```

---

### 4. Gemini Model Availability

**Challenge:** `gemini-1.5-flash` was unavailable. Switched to `gemini-2.5-flash` which occasionally returns 503 under high demand on the free tier.

**Solution:** The `extractIntent()` function catches all errors and returns `UNKNOWN` intent gracefully — the chat shows a helpful fallback message instead of crashing. In production, retry logic with exponential backoff would be added.

---

### 5. AI Intent Schema Design

**Challenge:** A flat intent schema caused TypeScript to lose type information, requiring unsafe casts everywhere.

**Solution:** Used `z.discriminatedUnion` from Zod — TypeScript automatically narrows the type in each `case` of the intent router switch statement, eliminating the need for manual type guards.

---

### 6. Mongoose Populated Fields TypeScript

**Challenge:** Mongoose's `.populate()` returns populated documents at runtime, but TypeScript still sees the field as `ObjectId`, causing type errors on access.

**Solution:** Use `.lean()` to get plain JavaScript objects, then cast through `unknown`:

```typescript
const product = item.productId as unknown as { name: string; price: number };
```

---

## New Knowledge & Skills Learned

- **Next.js 15 App Router** — async params, Server vs Client Component boundaries, `router.refresh()` for re-mounting
- **Custom JWT authentication** — access/refresh token rotation, HTTP-only cookie security, `sameSite` behavior
- **LLM prompt engineering** — system prompts with typed JSON schemas and few-shot examples to get consistent structured output
- **Zod as an AI output validator** — treating LLM responses as untrusted external input that must be validated before touching the database
- **MongoDB text indexes** — weighted scoring across multiple fields for relevance-ranked search
- **`z.discriminatedUnion`** — type-safe discriminated unions that eliminate runtime type guards
- **React concurrent features** — `useTransition` for non-urgent state updates, cleanup patterns for async effects

---

## AI Tool Usage

I used **Claude (Anthropic)** throughout this project as a senior architect and code reviewer.

**How I used it:**

- **Architecture planning** — Designed the full folder structure, authentication flow, and AI pipeline architecture before writing any code
- **Code generation** — Generated boilerplate for models, services, and API routes which I then reviewed and modified
- **Bug investigation** — When I encountered errors (cookie issues, TypeScript errors, Next.js 15 breaking changes), I shared the exact error messages and got targeted fixes
- **Decision making** — Asked for comparison of approaches (e.g. embedded chat messages array vs one document per message) and chose based on the reasoning provided

**What I verified and modified:**

- Adapted folder naming and structure to my preferences
- Tested every feature in the browser before moving to the next
- All bugs were debugged by me first — I checked DevTools, read error messages, and formed hypotheses before asking for help

---

### Fully Implemented

- ✅ Product catalog with images, sizes, categories, tags, search and filters
- ✅ All 10 chat intents (browse, add, remove, update quantity, view cart, checkout all, checkout single item, cancel order, request size, unknown)
- ✅ Size request feature — automatically created when size unavailable
- ✅ User registration and login with JWT authentication
- ✅ Chat history persisted and linked to user account
- ✅ Inline product cards, cart summary, and order confirmation in chat
- ✅ Cart page — add from shop UI, remove, update quantity, checkout all or single item
- ✅ Orders page — full history, cancel button on cancellable orders
- ✅ RBAC — CUSTOMER and ADMIN roles
- ✅ Admin dashboard with live stats (revenue excludes cancelled orders)
- ✅ Admin order management — update status via dropdown
- ✅ Admin size request management — mark as fulfilled
- ✅ Demo/Help page with example chat messages
- ✅ Deployed on Vercel

### Known Limitations

- Gemini free tier occasionally returns 503 under high demand — user must resend the message
- No real payment processing (as per requirements — checkout is simulated)
- No email notifications when size request is fulfilled
- Chat history loads first 50 messages only (no infinite scroll)
