import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "[Gemini] GEMINI_API_KEY is not set. Intent extraction will not work.",
  );
}

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
