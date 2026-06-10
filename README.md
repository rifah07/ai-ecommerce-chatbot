# ShopBot — AI-Powered E-Commerce Chatbot

A full-stack e-commerce application where users interact with an AI chatbot to browse products, manage their cart, and checkout — all through natural language.

## Live Demo

> [Vercel URL]

**Test Accounts**
| Role | Email | Password |
|---|---|---|
| Customer | Register at /register | Your choice |
| Admin | admin@shopbot.com | Admin1234! |

---

## Tech Stack

| Layer      | Technology                                                               |
| ---------- | ------------------------------------------------------------------------ |
| Frontend   | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui                          |
| Backend    | Next.js API Routes (Controller pattern)                                  |
| Database   | MongoDB Atlas + Mongoose                                                 |
| Auth       | Custom JWT — Access Token (15m) + Refresh Token (7d) + HTTP-only Cookies |
| AI         | Google Gemini 2.5 flash — intent extraction only                         |
| Deployment | Vercel                                                                   |

---

## Architecture

```
User Message → Gemini (Intent Extraction) → Zod Validation → Service Layer → MongoDB → Response
```

**The AI never executes business logic.** Gemini only extracts intent and entities from natural language. All business logic lives in the service layer, making the system predictable, testable, and safe.

### Folder Structure

```
src/
├── app/                    # Next.js App Router — pages and API routes
│   ├── (auth)/             # Login, Register
│   ├── (shop)/             # Shop, Cart, Chat, Orders
│   ├── (admin)/            # Admin Dashboard, Orders, Size Requests
│   └── api/                # REST API endpoints (controllers)
├── models/                 # Mongoose schemas
├── services/               # Business logic layer
├── validators/             # Zod schemas for input + AI output
├── constants/              # Shared enums and constants
├── types/                  # Shared TypeScript interfaces
├── data/                   # Seed data (30 products)
├── hooks/                  # React hooks (useAuth, useCart, useChat)
├── components/             # UI components
└── lib/                    # Infrastructure (DB, JWT, Gemini, errors)
    ├── db/                 # MongoDB connection singleton
    ├── auth/               # JWT, cookies, requireAuth, requireRole
    ├── gemini/             # Gemini client + extractIntent()
    └── utils/              # AppError, response helpers, bcrypt
```

---

## Features

### Customer

- Register and login with JWT authentication
- Browse 30 products (15 T-Shirts, 15 Pants) with filters by category, size, tag, and search
- **AI Chatbot** — natural language interface for all shopping actions:
  - Browse products: _"show me running t-shirts in size L"_
  - Add to cart: _"add slim chino in M to my cart"_
  - Remove from cart: _"remove the polo"_
  - View cart: _"what is in my cart"_
  - Checkout: _"checkout"_
  - Size requests: automatically created when requested size is unavailable
- Cart page — view items, remove items, checkout all or single item
- Orders page — full order history

### Admin

- Dashboard with stats (total orders, customers, revenue, pending size requests)
- All orders table with customer info
- Size requests table — mark as Fulfilled or Pending

---

## Supported Chat Intents

| Intent           | Example                         |
| ---------------- | ------------------------------- |
| BROWSE_PRODUCTS  | "show me gym pants in size M"   |
| ADD_TO_CART      | "add 2 classic white tees in L" |
| REMOVE_FROM_CART | "remove the polo from my cart"  |
| VIEW_CART        | "what is in my cart"            |
| CHECKOUT         | "checkout"                      |
| REQUEST_SIZE     | "I want the running tee in XXL" |
| UNKNOWN          | "what is the weather"           |

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/ai-ecommerce-chatbot.git
cd ai-ecommerce-chatbot
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

### 3. Run development server

```bash
npm run dev
```

### 4. Seed the database

```bash
curl -X POST http://localhost:3000/api/seed
```

This creates 30 products and one admin account (`admin@shopbot.com` / `Admin1234!`).

### 5. Open the app

```
http://localhost:3000
```

---

## Key Design Decisions

**Why Next.js API Routes instead of a separate backend?**
Single repo, shared TypeScript types, zero CORS configuration, one Vercel deployment.

**Why custom JWT instead of NextAuth?**
Full control over token lifecycle. Short-lived access tokens (15m) paired with refresh tokens (7d) in HTTP-only cookies — immune to XSS attacks.

**Why Gemini for intent extraction only?**
AI output is non-deterministic. By restricting Gemini to intent extraction and validating its output with Zod before any database operation, the business logic remains 100% predictable and testable.

**Why one document per chat message?**
Enables native MongoDB pagination, efficient compound index on `{userId, timestamp}`, and clean per-message querying — better than embedding a growing array in a single document.

**Why snapshot product data in orders?**
Products can change price or be deleted after purchase. Snapshotting name and price at checkout time ensures order history is always accurate.
