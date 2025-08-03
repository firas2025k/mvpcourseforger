import { model, generationConfig, safetySettings } from "./gemini";
import { makeMistralAPICall } from "./mistral";

/**
 * Multi-model API call with fallback mechanism
 * First attempts Gemini API, then falls back to Mistral API if Gemini fails
 * @param prompt The prompt to send to the AI models
 * @param context Context for logging
 * @param maxRetries Maximum number of retries per model
 * @returns Promise<{response: string, modelUsed: 'gemini' | 'mistral'}> The response and which model was used
 */
export async function makeMultiModelAPICall(
  prompt: string,
  context: string,
  maxRetries: number = 3
): Promise<{ response: string; modelUsed: "gemini" | "mistral" }> {
  // First, try Gemini API
  try {
    console.log(`${context} - Attempting with Gemini first`);
    const geminiResponse = await makeGeminiAPICallWithRetry(
      prompt,
      context,
      maxRetries
    );
    console.log(`${context} - Gemini succeeded`);
    return {
      response: geminiResponse,
      modelUsed: "gemini",
    };
  } catch (geminiError: any) {
    console.warn(
      `${context} - Gemini failed, falling back to Mistral:`,
      geminiError.message
    );

    // Fallback to Mistral API
    try {
      console.log(`${context} - Attempting with Mistral as fallback`);
      const mistralResponse = await makeMistralAPICall(
        prompt,
        context,
        maxRetries
      );
      console.log(`${context} - Mistral fallback succeeded`);
      return {
        response: mistralResponse,
        modelUsed: "mistral",
      };
    } catch (mistralError: any) {
      console.error(`${context} - Both Gemini and Mistral failed`);
      throw new Error(
        `Both models failed. Gemini: ${geminiError.message}. Mistral: ${mistralError.message}`
      );
    }
  }
}

/**
 * Internal Gemini API call with retry logic (extracted from route.ts logic)
 * @param prompt The prompt to send to Gemini
 * @param context Context for logging
 * @param maxRetries Maximum number of retries
 * @returns Promise<string> The response text
 */
async function makeGeminiAPICallWithRetry(
  prompt: string,
  context: string,
  maxRetries: number = 3
): Promise<string> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${context} - Gemini attempt ${attempt}/${maxRetries}`);
      const chatSession = model.startChat({ generationConfig, safetySettings });
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      console.log(`${context} - Gemini success on attempt ${attempt}`);
      return responseText;
    } catch (error: any) {
      lastError = error;
      console.error(
        `${context} - Gemini attempt ${attempt} failed:`,
        error.message
      );
      if (error.message && error.message.includes("503")) {
        console.log(
          `${context} - 503 error detected, retrying in ${
            attempt * 2
          } seconds...`
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }
      break;
    }
  }
  throw new Error(
    `${context} failed after ${maxRetries} attempts. Last error: ${
      lastError?.message || "Unknown error"
    }`
  );
}

/**
 * Enhanced JSON parser that handles responses from both Gemini and Mistral
 * @param text Raw text from AI response
 * @param context Context for error logging
 * @param modelUsed Which model generated the response
 * @returns Parsed JSON object or null if parsing fails
 */
export function parseMultiModelAIResponse(
  text: string,
  context: string,
  modelUsed: "gemini" | "mistral"
): any {
  try {
    let cleanText = text.trim();

    // For Gemini responses, remove markdown code blocks if present
    if (modelUsed === "gemini") {
      cleanText = cleanText.replace(/^```json\s*\n?|\n?```\s*$/g, "").trim();
      const jsonStart = cleanText.indexOf("{");
      const jsonEnd = cleanText.lastIndexOf("}");
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanText = cleanText.substring(jsonStart, jsonEnd + 1);
      }
    }
    // For Mistral responses with JSON mode, the response should already be clean JSON
    // but we still apply basic cleaning just in case
    else if (modelUsed === "mistral") {
      // Mistral with JSON mode should return clean JSON, but let's be safe
      if (cleanText.startsWith("```json")) {
        cleanText = cleanText.replace(/^```json\s*\n?|\n?```\s*$/g, "").trim();
      }
    }

    console.log(
      `Attempting to parse ${context} from ${modelUsed}:`,
      cleanText.substring(0, 200) + "..."
    );
    return JSON.parse(cleanText);
  } catch (error) {
    console.error(`Failed to parse ${context} from ${modelUsed}:`, error);
    console.error(`Raw text (first 500 chars):`, text.substring(0, 500));
    return null;
  }
}

/**
 * Utility function to determine if an error should trigger fallback to another model
 * @param error The error object
 * @returns boolean indicating if fallback should be attempted
 */
export function shouldFallbackToAlternateModel(error: any): boolean {
  if (!error || !error.message) return false;

  const errorMessage = error.message.toLowerCase();

  // Common transient errors that warrant fallback
  const fallbackTriggers = [
    "503",
    "502",
    "500", // Server errors
    "timeout",
    "econnreset",
    "enotfound", // Network errors
    "rate limit",
    "quota exceeded", // Rate limiting
    "service unavailable",
    "temporarily unavailable", // Service issues
    "internal error",
    "unknown error", // Generic errors
  ];

  return fallbackTriggers.some((trigger) => errorMessage.includes(trigger));
}
