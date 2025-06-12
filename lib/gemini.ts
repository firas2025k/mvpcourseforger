import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 0.6, // Lowered for more predictable JSON output
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 16384, // Increased for larger courses
  responseMimeType: "application/json",
};

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

export async function generateContentWithGemini(prompt: string, retries: number = 2) {
  let attempts = 0;
  while (attempts <= retries) {
    try {
      const chatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: [],
      });

      const result = await chatSession.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      attempts++;
      if (attempts > retries) {
        console.error(`Failed after ${retries} retries:`, error);
        throw new Error("Failed to generate content with Gemini.");
      }
      console.warn(`Retry ${attempts}/${retries} due to error:`, error);
    }
  }
  throw new Error("Unexpected error in generateContentWithGemini.");
}