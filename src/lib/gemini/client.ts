import { GoogleGenerativeAI } from "@google/generative-ai";
import { IntentSchema, type ParsedIntent } from "@/validators/intentValidators";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) console.warn("[Gemini] GEMINI_API_KEY not set.");
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const SYSTEM_PROMPT = `
You are an intent extraction engine for an e-commerce chatbot selling T-Shirts and Pants.
Return ONLY valid JSON matching one of the schemas below. No prose, no markdown, no code fences.

INTENT SCHEMAS:

Browse: {"intent":"BROWSE_PRODUCTS","filters":{"category":"T-Shirt|Pants","size":"S|M|L|XL|XXL","tag":"string","search":"string"},"confidence":"high|medium|low"}
Add to cart: {"intent":"ADD_TO_CART","target":{"productName":"string","size":"S|M|L|XL|XXL","quantity":1},"confidence":"high|medium|low"}
Remove from cart: {"intent":"REMOVE_FROM_CART","target":{"productName":"string","size":"S|M|L|XL|XXL"},"confidence":"high|medium|low"}
Update quantity: {"intent":"UPDATE_QUANTITY","target":{"productName":"string","size":"S|M|L|XL|XXL","quantity":2},"confidence":"high|medium|low"}
View cart: {"intent":"VIEW_CART","confidence":"high|medium|low"}
Checkout all: {"intent":"CHECKOUT","confidence":"high|medium|low"}
Checkout specific item: {"intent":"CHECKOUT_ITEM","target":{"productName":"string","size":"S|M|L|XL|XXL"},"confidence":"high|medium|low"}
Cancel order: {"intent":"CANCEL_ORDER","orderId":"optional string","confidence":"high|medium|low"}
Request size: {"intent":"REQUEST_SIZE","target":{"productName":"string","size":"S|M|L|XL|XXL"},"confidence":"high|medium|low"}
Unknown: {"intent":"UNKNOWN","confidence":"low"}

EXAMPLES:
"show running t-shirts in L" → {"intent":"BROWSE_PRODUCTS","filters":{"category":"T-Shirt","size":"L","tag":"running"},"confidence":"high"}
"add slim chino in M" → {"intent":"ADD_TO_CART","target":{"productName":"slim chino","size":"M","quantity":1},"confidence":"high"}
"change polo quantity to 2" → {"intent":"UPDATE_QUANTITY","target":{"productName":"polo","quantity":2},"confidence":"high"}
"set shirt A quantity from 4 to 1" → {"intent":"UPDATE_QUANTITY","target":{"productName":"shirt A","quantity":1},"confidence":"high"}
"checkout only the slim chino" → {"intent":"CHECKOUT_ITEM","target":{"productName":"slim chino"},"confidence":"high"}
"cancel my order" → {"intent":"CANCEL_ORDER","confidence":"high"}
"checkout" → {"intent":"CHECKOUT","confidence":"high"}
"view cart" → {"intent":"VIEW_CART","confidence":"high"}
`;

export async function extractIntent(
  userMessage: string,
  recentMessages: { role: string; content: string }[] = [],
): Promise<ParsedIntent> {
  if (!genAI) return { intent: "UNKNOWN", confidence: "low" };

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const contextBlock = recentMessages
    .slice(-6)
    .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
    .join("\n");

  const prompt = contextBlock
    ? `Recent conversation:\n${contextBlock}\n\nNew message: ${userMessage}`
    : userMessage;

  try {
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const jsonText = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return { intent: "UNKNOWN", confidence: "low" };
    }

    const validation = IntentSchema.safeParse(parsed);
    if (!validation.success) return { intent: "UNKNOWN", confidence: "low" };
    return validation.data;
  } catch (err) {
    console.error("[Gemini] API error:", err);
    return { intent: "UNKNOWN", confidence: "low" };
  }
}
