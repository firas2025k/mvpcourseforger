// app/api/voice-agent/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

// ----- INTERFACES -----

interface CreateVoiceAgentRequestBody {
  name: string;
  subject: string;
  topic: string;
  voice: "male" | "female";
  style: "formal" | "casual";
  duration: number;
}

// ----- CREDIT CALCULATION FUNCTIONS -----

/**
 * Calculates the credit cost for creating a voice agent
 * @param duration Duration of the voice agent session in minutes
 * @returns Credit cost for the voice agent creation
 */
function calculateVoiceAgentCreditCost(duration: number): number {
  // Base cost of 2 credits + 1 credit per 10 minutes (rounded up)
  const baseCost = 2;
  const durationCost = Math.ceil(duration / 10);
  const totalCost = baseCost + durationCost;
  return Math.max(totalCost, 3); // Minimum cost of 3 credits
}

/**
 * Deducts credits from user's balance and records the transaction
 * @param supabase Supabase client
 * @param userId User ID
 * @param creditCost Number of credits to deduct
 * @param relatedEntityId Voice agent ID or placeholder for transaction reference
 * @param description Transaction description
 * @returns Promise<boolean> Success status
 */
async function deductCreditsAndRecordTransaction(
  supabase: any,
  userId: string,
  creditCost: number,
  relatedEntityId: string,
  description: string
): Promise<boolean> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error(
        "Error fetching user profile for credit deduction:",
        fetchError
      );
      return false;
    }

    const currentCredits = profile.credits || 0;
    const newBalance = currentCredits - creditCost;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating credit balance:", updateError);
      return false;
    }

    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        type: "consumption",
        amount: -creditCost,
        related_entity_id: relatedEntityId,
        description: description,
      });

    if (transactionError) {
      console.error("Error recording credit transaction:", transactionError);
    }

    console.log(
      `Successfully deducted ${creditCost} credits from user ${userId}. New balance: ${newBalance}`
    );
    return true;
  } catch (error) {
    console.error("Error in credit deduction process:", error);
    return false;
  }
}

/**
 * Refunds credits to user's balance and records the transaction
 * @param supabase Supabase client
 * @param userId User ID
 * @param creditAmount Number of credits to refund
 * @param relatedEntityId Voice agent ID for transaction reference
 * @param description Transaction description
 * @returns Promise<boolean> Success status
 */
async function refundCreditsAndRecordTransaction(
  supabase: any,
  userId: string,
  creditAmount: number,
  relatedEntityId: string,
  description: string
): Promise<boolean> {
  try {
    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", userId)
      .single();

    if (fetchError || !profile) {
      console.error(
        "Error fetching user profile for credit refund:",
        fetchError
      );
      return false;
    }

    const currentCredits = profile.credits || 0;
    const newBalance = currentCredits + creditAmount;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ credits: newBalance })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating credit balance for refund:", updateError);
      return false;
    }

    const { error: transactionError } = await supabase
      .from("credit_transactions")
      .insert({
        user_id: userId,
        type: "adjustment",
        amount: creditAmount,
        related_entity_id: relatedEntityId,
        description: description,
      });

    if (transactionError) {
      console.error(
        "Error recording credit refund transaction:",
        transactionError
      );
    }

    console.log(
      `Successfully refunded ${creditAmount} credits to user ${userId}. New balance: ${newBalance}`
    );
    return true;
  } catch (error) {
    console.error("Error in credit refund process:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch (error) {}
        },
      },
    }
  );

  try {
    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized: User not authenticated." },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    const body = (await request.json()) as CreateVoiceAgentRequestBody;
    const { name, subject, topic, voice, style, duration } = body;

    if (!name || !subject || !topic || !voice || !style || !duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 3. Validate input ranges
    if (duration < 5 || duration > 120) {
      return NextResponse.json(
        { error: "Duration must be between 5 and 120 minutes" },
        { status: 400 }
      );
    }

    if (!["male", "female"].includes(voice)) {
      return NextResponse.json(
        { error: 'Voice must be either "male" or "female"' },
        { status: 400 }
      );
    }

    if (!["formal", "casual"].includes(style)) {
      return NextResponse.json(
        { error: 'Style must be either "formal" or "casual"' },
        { status: 400 }
      );
    }

    // 4. Calculate credit cost
    const creditCost = calculateVoiceAgentCreditCost(duration);

    // 5. Check user's credit balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("credits")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError?.message);
      return NextResponse.json(
        { error: "Could not retrieve user profile." },
        { status: 500 }
      );
    }

    const currentCredits = profile.credits || 0;

    if (currentCredits < creditCost) {
      return NextResponse.json(
        {
          error: `Insufficient credits. This voice agent requires ${creditCost} credits, but you have ${currentCredits} credits available. Please purchase more credits to continue.`,
          required_credits: creditCost,
          available_credits: currentCredits,
        },
        { status: 402 }
      );
    }

    // 6. Deduct credits BEFORE creation
    const creditDeductionSuccess = await deductCreditsAndRecordTransaction(
      supabase,
      user.id,
      creditCost,
      "pending",
      `Voice agent creation: ${name} (${subject} - ${topic}, ${duration} minutes)`
    );

    if (!creditDeductionSuccess) {
      return NextResponse.json(
        { error: "Failed to process credit payment." },
        { status: 500 }
      );
    }

    try {
      // 7. Create the voice agent/companion
      const companionData = {
        name,
        subject,
        topic,
        voice,
        style,
        duration,
        author: user.id,
      };

      const { data: companion, error: companionError } = await supabase
        .from("companions")
        .insert(companionData)
        .select()
        .single();

      if (companionError || !companion) {
        throw new Error(
          companionError?.message || "Failed to create voice agent"
        );
      }

      // 8. Update the credit transaction with the actual companion ID
      await supabase
        .from("credit_transactions")
        .update({ related_entity_id: companion.id })
        .eq("user_id", user.id)
        .eq("related_entity_id", "pending")
        .eq(
          "description",
          `Voice agent creation: ${name} (${subject} - ${topic}, ${duration} minutes)`
        );

      // 9. Return success response
      return NextResponse.json(
        {
          success: true,
          companion: companion,
          creditCost: creditCost,
          remainingCredits: currentCredits - creditCost,
          message: `Voice agent "${name}" created successfully! ${creditCost} credits deducted.`,
          redirectUrl: `/dashboard/voice/${companion.id}`,
        },
        { status: 201 }
      );
    } catch (creationError) {
      // Refund credits if companion creation fails
      const refundSuccess = await refundCreditsAndRecordTransaction(
        supabase,
        user.id,
        creditCost,
        "failed",
        `Refund for failed voice agent creation: ${name}`
      );

      if (refundSuccess) {
        console.log(`Refunded ${creditCost} credits to user ${user.id}`);
      }

      const errorMessage =
        creationError instanceof Error
          ? creationError.message
          : "Unknown error";
      return NextResponse.json(
        {
          error: `Failed to create voice agent: ${errorMessage}. Your credits have been refunded.`,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in /api/voice-agent/create:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return NextResponse.json(
      { error: `Failed to create voice agent: ${errorMessage}` },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve credit cost estimation
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const duration = parseInt(searchParams.get("duration") || "15");

  if (duration < 5 || duration > 120) {
    return NextResponse.json(
      { error: "Duration must be between 5 and 120 minutes" },
      { status: 400 }
    );
  }

  const creditCost = calculateVoiceAgentCreditCost(duration);

  return NextResponse.json(
    {
      duration: duration,
      creditCost: creditCost,
      breakdown: {
        baseCost: 2,
        durationCost: Math.ceil(duration / 10),
        total: creditCost,
      },
    },
    { status: 200 }
  );
}
