// lib/voice-agent-credits.ts

/**
 * Calculates the credit cost for creating a voice agent (client-side calculation)
 * @param duration Duration of the voice agent session in minutes
 * @returns Credit cost for the voice agent creation
 */
export function calculateVoiceAgentCreditCost(duration: number): number {
  // Base cost of 2 credits + 1 credit per 10 minutes (rounded up)
  const baseCost = 2;
  const durationCost = Math.ceil(duration / 10);
  const totalCost = baseCost + durationCost;
  return Math.max(totalCost, 3); // Minimum cost of 3 credits
}

/**
 * Fetches credit cost estimation from the API
 * @param duration Duration in minutes
 * @returns Promise with credit cost details
 */
export async function fetchVoiceAgentCreditCost(duration: number): Promise<{
  duration: number;
  creditCost: number;
  breakdown: {
    baseCost: number;
    durationCost: number;
    total: number;
  };
}> {
  try {
    const response = await fetch(
      `/api/voice-agent/create?duration=${duration}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch credit cost");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching credit cost:", error);
    // Fallback to client-side calculation
    const creditCost = calculateVoiceAgentCreditCost(duration);
    return {
      duration,
      creditCost,
      breakdown: {
        baseCost: 2,
        durationCost: Math.ceil(duration / 10),
        total: creditCost,
      },
    };
  }
}

/**
 * Validates voice agent form data
 * @param formData Form data to validate
 * @returns Validation result with errors if any
 */
export function validateVoiceAgentData(formData: {
  name: string;
  subject: string;
  topic: string;
  voice: string;
  style: string;
  duration: number;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!formData.name || formData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  if (!formData.subject || formData.subject.trim().length === 0) {
    errors.push("Subject is required");
  }

  if (!formData.topic || formData.topic.trim().length < 5) {
    errors.push("Topic must be at least 5 characters long");
  }

  if (!["male", "female"].includes(formData.voice)) {
    errors.push('Voice must be either "male" or "female"');
  }

  if (!["formal", "casual"].includes(formData.style)) {
    errors.push('Style must be either "formal" or "casual"');
  }

  if (formData.duration < 5 || formData.duration > 120) {
    errors.push("Duration must be between 5 and 120 minutes");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
