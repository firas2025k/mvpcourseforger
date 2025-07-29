import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Use the faster model variant
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Faster than gemini-2.5-flash
});

const generationConfig = {
  temperature: 0.3, // Lower temperature = faster generation
  topP: 0.8, // Reduced from 0.95 for speed
  topK: 40, // Reduced from 64 for speed
  maxOutputTokens: 16384, // Reduced from 16384 - adjust based on your needs
  responseMimeType: "application/json",
};

// Relaxed safety settings for faster processing
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH, // More permissive
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
  },
];

export { model, generationConfig, safetySettings };

// Optimized function with better error handling and timeout
export async function generateContentWithGemini(
  prompt: string,
  retries: number = 1, // Reduced retries for faster failure
  timeoutMs: number = 30000 // 30 second timeout
) {
  let attempts = 0;

  while (attempts <= retries) {
    try {
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), timeoutMs)
      );

      const result = await Promise.race([
        chatSession.sendMessage(prompt),
        timeoutPromise,
      ]);

      return (result as any).response.text();
    } catch (error) {
      attempts++;
      if (attempts > retries) {
        console.error(`Failed after ${retries} retries:`, error);
        throw new Error(`Failed to generate content with Gemini: ${error}`);
      }
      console.warn(`Retry ${attempts}/${retries} due to error:`, error);

      // Short delay before retry to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  throw new Error("Unexpected error in generateContentWithGemini.");
}

// Alternative: Batch processing function for large courses
export async function generateCourseInBatches(
  coursePrompts: string[],
  batchSize: number = 3
) {
  const results = [];

  for (let i = 0; i < coursePrompts.length; i += batchSize) {
    const batch = coursePrompts.slice(i, i + batchSize);

    // Process batch in parallel
    const batchPromises = batch.map(
      (prompt) => generateContentWithGemini(prompt, 1, 20000) // Shorter timeout for batches
    );

    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      // Handle failed batch - you might want to retry individual items
      throw error;
    }

    // Small delay between batches to respect rate limits
    if (i + batchSize < coursePrompts.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return results;
}
