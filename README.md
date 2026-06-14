# ShopBot — AI-Powered E-Commerce Chatbot

## Project Summary

ShopBot is a conversational e-commerce application built with Next.js 15, MongoDB Atlas, Mongoose, and Google Gemini 2.5 Flash.

The application allows users to browse products, manage their cart, and place orders entirely through natural language conversations while maintaining a traditional storefront experience.

### Key Highlights

- Conversational shopping powered by Gemini 2.5 Flash
- 10 supported chat intents
- JWT authentication with access and refresh tokens
- Persistent chat history linked to user accounts
- MongoDB Atlas + Mongoose
- Customer and Admin role-based access control
- Admin dashboard for order and size request management
- Fully deployed production application

### Supported Chat Actions

- Browse products
- Add items to cart
- Remove items from cart
- Update quantities
- View cart contents
- Checkout entire cart
- Checkout a single item
- Cancel orders
- Request unavailable sizes
- Intelligent fallback handling for unsupported requests

---

## Live Demo

> **Live URL:** https://ai-ecommerce-chatbot-six.vercel.app/shop
> **GitHub:** [ai-ecommerce-chatbot](https://github.com/rifah07/ai-ecommerce-chatbot.git)

### Test Accounts

| Role     | Email                                         | Password    |
| -------- | --------------------------------------------- | ----------- |
| Customer | Register at `/register`                       | Your choice |
| Admin    | [admin@shopbot.com](mailto:admin@shopbot.com) | Admin1234!  |

---

## Tech Stack

| Layer          | Technology                                                               |
| -------------- | ------------------------------------------------------------------------ |
| Frontend       | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui             |
| Backend        | Next.js API Routes — NestJS-inspired controller/service/model pattern    |
| Database       | MongoDB Atlas + Mongoose                                                 |
| Authentication | Custom JWT — Access Token (15m) + Refresh Token (7d) + HTTP-only Cookies |
| AI             | Google Gemini 2.5 Flash — intent extraction only                         |
| Deployment     | Vercel                                                                   |

---

## Architecture

```text
User Message → Gemini (Intent Extraction) → Zod Validation → Service Layer → MongoDB → Response
```

**The AI never executes business logic.** Gemini only extracts intent and entities from natural language. All business logic lives in the service layer — making the system predictable, testable, and safe from hallucination side effects.

If Gemini returns a 503 (free tier high demand) or malformed JSON, the system catches it gracefully, returns an `UNKNOWN` intent, and shows the user a helpful fallback message. Nothing crashes.

### Folder Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, Register
│   ├── (shop)/             # Shop, Cart, Chat, Orders, Demo
│   ├── (admin)/            # Admin Dashboard, Orders, Size Requests
│   └── api/                # REST API — controllers only, no business logic
├── models/                 # Mongoose schemas with indexes
├── services/               # All business logic
├── validators/             # Zod schemas for user input AND AI output
├── constants/              # Sizes, categories, roles, intent names
├── types/                  # Shared TypeScript interfaces
├── data/                   # 30 seed products with tags
├── hooks/                  # useAuth, useCart, useChat
├── components/             # UI components
└── lib/                    # Infrastructure only
    ├── db/                 # MongoDB connection singleton
    ├── auth/               # JWT, cookies, requireAuth, requireRole
    ├── gemini/             # Gemini client + extractIntent()
    └── utils/              # AppError, response helpers, bcrypt
```

## Why This Architecture?

Instead of allowing the LLM to directly execute business operations, Gemini is only responsible for extracting structured user intent from natural language.

```text
User Message
    ↓
Gemini
    ↓
Structured Intent
    ↓
Zod Validation
    ↓
Service Layer
    ↓
MongoDB
```

This approach provides several benefits:

- Predictable and testable business logic
- Reduced risk of AI hallucinations affecting data
- Strong runtime validation through Zod schemas
- Easier debugging and maintenance
- Ability to swap AI providers without changing application services

The AI interprets user intent, but every business action is performed by deterministic application code.

---

## Features

### Customer

#### Product Catalog

- 30 products — 15 T-Shirts + 15 Pants with real images (Unsplash)
- Filter by category, size, tag, or free-text search
- MongoDB text index with weighted relevance scoring (`name > tags > description`)
- Inline size picker on product cards — select size then add to cart without leaving the page

#### AI Chatbot — Supported Intents

| Intent             | Example                              | What Happens                          |
| ------------------ | ------------------------------------ | ------------------------------------- |
| `BROWSE_PRODUCTS`  | "Show me running t-shirts in size L" | Product cards render inline in chat   |
| `ADD_TO_CART`      | "Add slim chino in M to my cart"     | Adds item, checks size availability   |
| `REMOVE_FROM_CART` | "Remove the polo from my cart"       | Removes item by name                  |
| `UPDATE_QUANTITY`  | "Change polo quantity to 2"          | Updates quantity — does not remove    |
| `VIEW_CART`        | "What is in my cart?"                | Cart summary with totals              |
| `CHECKOUT`         | "Checkout"                           | Places order for entire cart          |
| `CHECKOUT_ITEM`    | "Checkout only the slim chino"       | Places order for one specific item    |
| `CANCEL_ORDER`     | "Cancel my order"                    | Cancels most recent cancellable order |
| `REQUEST_SIZE`     | "I want the Nike tee in XXL"         | Size request created automatically    |
| `UNKNOWN`          | "What is the weather?"               | Helpful fallback with suggestions     |

#### Size Request Feature

When a requested size is unavailable, instead of returning an error, the system creates a `SizeRequest` document in MongoDB and informs the user their request is recorded. Admins can mark requests as fulfilled when stock is restocked. This turns a failure state into a CRM feature.

#### Cart

- Add items from the product grid with inline size picker — no redirect needed
- Remove individual items
- Update quantity per item
- Checkout entire cart or a single specific item
- All cart actions available through chat

#### Orders

- Full order history with colour-coded status badges
- Cancel `PENDING` or `CONFIRMED` orders from the orders page
- Order cancellation also available through chat

#### Chat

- Persistent chat history linked to user account — survives page refresh
- Product cards render inline in chat as a horizontally scrollable strip
- After page refresh, product result messages show a **"Show products again"** button — clicking it re-runs the original query and fetches fresh results (better than showing stale cached data)
- Cart summary card renders when viewing cart via chat
- Order confirmation card renders after checkout via chat
- Conversation context passed to Gemini — bot understands `"add the first one in M"` after browsing
- Suggestion chips on empty chat state
- Typing indicator while AI processes

#### Demo / Help Page (`/demo`)

- Clickable example messages with copy-to-clipboard
- Organised by category: Browse, Cart, Checkout, Size Requests
- Tips on how to combine filters and use context references

### Admin

- **Dashboard** — total active orders, customer count, revenue (cancelled orders excluded), pending size requests
- **Orders table** — all orders with customer info, dropdown to update status (`PENDING → CONFIRMED → SHIPPED → DELIVERED → CANCELLED`)
- **Size requests table** — all requests with product image, toggle `PENDING ↔ FULFILLED`

---

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/rifah07/ai-ecommerce-chatbot.git
cd ai-ecommerce-chatbot
npm install
```

### 2. Environment Variables

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

### 3. Run Development Server

```bash
npm run dev
```

### 4. Seed the Database

```bash
curl -X POST http://localhost:3000/api/seed
```

Creates 30 products and one admin account:

```text
admin@shopbot.com
Admin1234!
```

Safe to run multiple times — never deletes chat history, orders, or cart items.

### 5. Visit the App

```text
http://localhost:3000        → redirects to /shop
http://localhost:3000/demo   → chat guide with example messages
```

````

---

## Challenges & How I Solved Them

### 1. Next.js 15 Cookie Handling — Auth Cookies Not Being Set

After login the Navbar still showed **Login** and **Register**. DevTools showed no cookies despite the API returning `200`.

**Root cause**

Two bugs together:

- `cookies()` from `next/headers` is unreliable inside helper functions called from Route Handlers in Next.js 15.
- `sameSite: "strict"` blocked cookies on the first request after redirect.

**Solution**

- Use `response.cookies.set()` directly on the `NextResponse`.
- Change `sameSite` to `"lax"`.
- Add `router.refresh()` after `router.push()`.

---

### 2. Next.js 15 Async Dynamic Params

Cart item deletion threw:

```text
params is a Promise and must be unwrapped with await
````

**Solution**

```typescript
const { itemId } = await (
  context as {
    params: Promise<{ itemId: string }>;
  }
).params;
```

---

### 3. React Cascading setState Warning

**Solution**

```typescript
useEffect(() => {
  let cancelled = false;

  async function load() {
    const data = await fetch(...);

    if (!cancelled) {
      setState(data);
    }
  }

  load();

  return () => {
    cancelled = true;
  };
}, [dependency]);
```

---

### 4. Chat History — MongoDB ObjectId vs String Mismatch

**Solution**

```typescript
const userObjectId = new mongoose.Types.ObjectId(userId);

ChatMessage.find({
  userId: userObjectId,
});
```

Applied consistently in:

- `saveMessage`
- `getHistory`
- `getRecentMessages`

---

### 5. Gemini Returning UNKNOWN After First Successful Request

**Solution**

```typescript
content: m.role === "assistant" && m.content.length > 120
  ? m.content.slice(0, 120) + "…"
  : m.content;
```

Assistant messages are truncated before being sent back as context.

---

### 6. Product Cards Gone After Page Refresh

**Considered options**

- Store product arrays in MongoDB
- Re-fetch products for every historical message
- Show a re-run button

**Solution**

Added:

```text
↻ Show products again
```

The button re-sends the original query and fetches fresh products.

---

### 7. Production 401 on Vercel (Cross-Region Cookie Issue)

**Solution**

- Added refresh-token fallback inside `requireAuth`
- Added `src/middleware.ts`
- Forced `/api/*` routes to run dynamically

---

## New Knowledge & Skills Gained

- **Next.js 15 App Router**
- **Custom JWT authentication**
- **LLM prompt engineering**
- **Zod AI output validation**
- **z.discriminatedUnion**
- **MongoDB text indexes**
- **Mongoose ObjectId handling**
- **React concurrent features**

---

## AI Tool Usage

I used **Claude (Anthropic)** throughout this project as a architect and code reviewer.

### Architecture & Planning

Designed:

- Folder structure
- Authentication flow
- AI intent-extraction pipeline

### Code Generation

Generated boilerplate for:

- Models
- Services
- API routes

Every file was reviewed before use.

### Bug Investigation

Used Claude to discuss:

- Cookie issues
- ObjectId mismatches
- Gemini context overflow

### What I Changed

- Added quantity updates
- Added single-item checkout
- Added order cancellation
- Added admin dashboard
- Added demo page

Every generated code block was understood before use.

---

### Fully Implemented

- ✅ Product catalog — 30 products, images, filters, text search
- ✅ 10 chat intents
- ✅ Size request workflow
- ✅ JWT authentication
- ✅ Persistent chat history
- ✅ Inline product cards
- ✅ Show products again button
- ✅ Inline size picker
- ✅ Cart management
- ✅ Orders management
- ✅ RBAC (CUSTOMER / ADMIN)
- ✅ Admin dashboard
- ✅ Admin order management
- ✅ Admin size request management
- ✅ Demo/help page
- ✅ Vercel deployment

### Known Limitations

- Gemini free tier occasionally returns `503` (handled gracefully)
- No real payment processing
- No email notifications for fulfilled size requests
- Chat history limited to first 50 messages (no pagination UI yet)
