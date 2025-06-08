import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Basic model configuration - you can customize this further
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Or your preferred model
});

// Default generation configuration - can be overridden per request
const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "application/json", // Expect JSON output for course structure
};

// Safety settings - adjust as needed for your use case
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

export { model, generationConfig, safetySettings };

/**
 * Example function to generate content.
 * You can create more specific functions based on your needs.
 */
export async function generateContentWithGemini(prompt: string) {
  try {
    const chatSession = model.startChat({
      generationConfig,
      safetySettings,
      history: [], // Add history if you want a conversational chat
    });

    const result = await chatSession.sendMessage(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw new Error("Failed to generate content with Gemini.");
  }
}
