import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntentSchema, type ParsedIntent } from "@/validators/intentValidators";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[Gemini] GEMINI_API_KEY not set.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// System prompt
const SYSTEM_PROMPT = `
You are an intent extraction engine for an e-commerce chatbot that sells T-Shirts and Pants.
Your ONLY job is to analyze a user message and return a structured JSON object.

CRITICAL RULES:
1. Return ONLY valid JSON. No prose, no explanations, no markdown, no code fences.
2. The JSON must exactly match one of the schemas below.
3. If the intent is unclear, use "UNKNOWN".
4. Tags must be lowercase (e.g., "running" not "Running").
5. Sizes must be exactly: "S", "M", "L", "XL", or "XXL".
6. Categories must be exactly: "T-Shirt" or "Pants".

INTENT SCHEMAS:

Browse products:
{"intent":"BROWSE_PRODUCTS","filters":{"category":"T-Shirt or Pants (optional)","size":"S|M|L|XL|XXL (optional)","tag":"lowercase string (optional)","search":"free text (optional)"},"confidence":"high|medium|low"}

Add to cart:
{"intent":"ADD_TO_CART","target":{"productName":"string (optional)","size":"S|M|L|XL|XXL (optional)","quantity":1},"confidence":"high|medium|low"}

Remove from cart:
{"intent":"REMOVE_FROM_CART","target":{"productName":"string (optional)","size":"S|M|L|XL|XXL (optional)","quantity":1},"confidence":"high|medium|low"}

View cart:
{"intent":"VIEW_CART","confidence":"high|medium|low"}

Checkout:
{"intent":"CHECKOUT","confidence":"high|medium|low"}

Request size:
{"intent":"REQUEST_SIZE","target":{"productName":"string (optional)","size":"S|M|L|XL|XXL (optional)"},"confidence":"high|medium|low"}

Unknown:
{"intent":"UNKNOWN","confidence":"low"}

EXAMPLES:
User: "show me running t-shirts in size L"
Output: {"intent":"BROWSE_PRODUCTS","filters":{"category":"T-Shirt","size":"L","tag":"running"},"confidence":"high"}

User: "add 2 large nike tees to my cart"
Output: {"intent":"ADD_TO_CART","target":{"productName":"nike tee","size":"L","quantity":2},"confidence":"high"}

User: "remove the polo from my cart"
Output: {"intent":"REMOVE_FROM_CART","target":{"productName":"polo"},"confidence":"medium"}

User: "what is in my cart"
Output: {"intent":"VIEW_CART","confidence":"high"}

User: "checkout"
Output: {"intent":"CHECKOUT","confidence":"high"}

User: "do you have joggers in XXL"
Output: {"intent":"BROWSE_PRODUCTS","filters":{"category":"Pants","size":"XXL","tag":"jogger"},"confidence":"high"}

User: "I want the slim chino in XXL"
Output: {"intent":"ADD_TO_CART","target":{"productName":"slim chino","size":"XXL","quantity":1},"confidence":"high"}

User: "what is the weather today"
Output: {"intent":"UNKNOWN","confidence":"low"}
`;

// Main extraction function

export async function extractIntent(
  userMessage: string,
  recentMessages: { role: string; content: string }[] = [],
): Promise<ParsedIntent> {
  if (!genAI) {
    console.warn("[Gemini] Client not initialized - returning UNKNOWN");
    return { intent: "UNKNOWN", confidence: "low" };
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  // Build context from last 6 messages (3 exchanges)
  const contextBlock = recentMessages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = contextBlock
    ? `Recent conversation:
${contextBlock}

New message: ${userMessage}`
    : userMessage;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();

    // Strip markdown code fences Gemini sometimes adds
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.warn("[Gemini] JSON parse failed:", rawText);
      return { intent: "UNKNOWN", confidence: "low" };
    }

    // Validate with Zod, never trust raw AI output
    const result2 = IntentSchema.safeParse(parsed);
    if (!result2.success) {
      console.warn(
        "[Gemini] Schema validation failed:",
        result2.error.flatten(),
      );
      return { intent: "UNKNOWN", confidence: "low" };
    }

    return result2.data;
  } catch (err) {
    console.error("[Gemini] API error:", err);
    return { intent: "UNKNOWN", confidence: "low" };
  }
}
