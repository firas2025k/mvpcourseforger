import fetch from "node-fetch";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;
const MISTRAL_API_BASE = "https://api.mistral.ai/v1";

interface MistralRequestBody {
  model: string;
  messages: Array<{
    role: string;
    content: string;
  }>;
  response_format?: {
    type: string;
  };
  temperature?: number;
  max_tokens?: number;
}

interface MistralResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Makes a Mistral API call with retry logic for transient errors
 * @param prompt The prompt to send to Mistral
 * @param context Context for logging
 * @param maxRetries Maximum number of retries
 * @returns Promise<string> The response text
 */
export async function makeMistralAPICall(
  prompt: string,
  context: string,
  maxRetries: number = 3
): Promise<string> {
  if (!MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not defined in environment variables.");
  }

  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`${context} - Mistral attempt ${attempt}/${maxRetries}`);

      const requestBody: MistralRequestBody = {
        model: "mistral-small-latest", // Using free tier model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.3,
        max_tokens: 16384,
      };

      const response = await fetch(`${MISTRAL_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as MistralResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No choices returned from Mistral API");
      }

      const responseText = data.choices[0].message.content;
      console.log(`${context} - Mistral success on attempt ${attempt}`);
      return responseText;
    } catch (error: any) {
      lastError = error;
      console.error(
        `${context} - Mistral attempt ${attempt} failed:`,
        error.message
      );

      // Check for specific error types that warrant retry
      if (
        error.message &&
        (error.message.includes("503") ||
          error.message.includes("502") ||
          error.message.includes("timeout") ||
          error.message.includes("ECONNRESET"))
      ) {
        console.log(
          `${context} - Transient error detected, retrying in ${
            attempt * 2
          } seconds...`
        );
        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
          continue;
        }
      }

      // For non-retryable errors, break immediately
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
 * Optimized function with better error handling and timeout for Mistral
 * @param prompt The prompt to send to Mistral
 * @param retries Number of retries
 * @param timeoutMs Timeout in milliseconds
 * @returns Promise<string> The response text
 */
export async function generateContentWithMistral(
  prompt: string,
  retries: number = 2,
  timeoutMs: number = 30000
): Promise<string> {
  let attempts = 0;

  while (attempts <= retries) {
    try {
      if (!MISTRAL_API_KEY) {
        throw new Error(
          "MISTRAL_API_KEY is not defined in environment variables."
        );
      }

      const requestBody: MistralRequestBody = {
        model: "mistral-small-latest",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_object",
        },
        temperature: 0.3,
        max_tokens: 16384,
      };

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
      );

      const fetchPromise = fetch(`${MISTRAL_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${MISTRAL_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      const response = (await Promise.race([
        fetchPromise,
        timeoutPromise,
      ])) as Response;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mistral API error ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as MistralResponse;

      if (!data.choices || data.choices.length === 0) {
        throw new Error("No choices returned from Mistral API");
      }

      return data.choices[0].message.content;
    } catch (error) {
      attempts++;
      if (attempts > retries) {
        console.error(`Failed after ${retries} retries:`, error);
        throw new Error(`Failed to generate content with Mistral: ${error}`);
      }
      console.warn(`Retry ${attempts}/${retries} due to error:`, error);

      // Short delay before retry to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw new Error("Unexpected error in generateContentWithMistral.");
}
