"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// import type { Database } from '../types/supabase'; // Uncomment if you have a Database type
import { revalidatePath } from "next/cache";

// TODO: Define CreateCompanion, GetAllCompanions types in your types folder if needed

const getSupabaseAndUser = async () => {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
};

// TODO: Replace 'any' with a proper CreateCompanion type
export const createCompanion = async (formData: any) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");

  const { name, subject, topic, voice, style, duration } = formData;

  // Validate input
  if (!name || !subject || !topic || !voice || !style || !duration) {
    throw new Error("Missing required fields");
  }

  if (duration < 5 || duration > 120) {
    throw new Error("Duration must be between 5 and 120 minutes");
  }

  // Calculate credit cost
  const baseCost = 2;
  const durationCost = Math.ceil(duration / 10);
  const creditCost = Math.max(baseCost + durationCost, 3);

  // Check user's credit balance
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw new Error("Could not retrieve user profile");
  }

  const currentCredits = profile.credits || 0;

  if (currentCredits < creditCost) {
    throw new Error(
      `Insufficient credits. This voice agent requires ${creditCost} credits, but you have ${currentCredits} credits available.`
    );
  }

  // Deduct credits
  const newBalance = currentCredits - creditCost;
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ credits: newBalance })
    .eq("id", user.id);

  if (updateError) {
    throw new Error("Failed to process credit payment");
  }

  try {
    // Create companion
    const insertData = {
      name,
      subject,
      topic,
      voice,
      style,
      duration,
      author: user.id,
    };

    const { data, error } = await supabase
      .from("companions")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      // Refund credits if companion creation fails
      await supabase
        .from("profiles")
        .update({ credits: currentCredits })
        .eq("id", user.id);

      throw new Error(error?.message || "Failed to create a companion");
    }

    // Record credit transaction
    await supabase.from("credit_transactions").insert({
      user_id: user.id,
      type: "consumption",
      amount: -creditCost,
      related_entity_id: data.id,
      description: `Voice agent creation: ${name} (${subject} - ${topic}, ${duration} minutes)`,
    });

    return data;
  } catch (error) {
    // Refund credits on any error
    await supabase
      .from("profiles")
      .update({ credits: currentCredits })
      .eq("id", user.id);

    throw error;
  }
};

// TODO: Replace this inline type with a proper GetAllCompanions type
export const getAllCompanions = async ({
  limit = 10,
  page = 1,
  subject,
  topic,
}: {
  limit?: number;
  page?: number;
  subject?: string;
  topic?: string;
}) => {
  const { supabase } = await getSupabaseAndUser();
  let query = supabase.from("companions").select();
  if (subject && topic) {
    query = query
      .ilike("subject", `%${subject}%`)
      .or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  } else if (subject) {
    query = query.ilike("subject", `%${subject}%`);
  } else if (topic) {
    query = query.or(`topic.ilike.%${topic}%,name.ilike.%${topic}%`);
  }
  query = query.range((page - 1) * limit, page * limit - 1);
  const { data: companions, error } = await query;
  if (error) throw new Error(error.message);
  return companions;
};

export const getCompanion = async (id: string) => {
  const { supabase } = await getSupabaseAndUser();
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id);
  if (error) return console.log(error);
  return data[0];
};

export const addToSessionHistory = async (companionId: string) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: user.id,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const { supabase } = await getSupabaseAndUser();
  const { data, error } = await supabase
    .from("session_history")
    .select("companions:companion_id (*)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data.map(({ companions }) => companions);
};

export const getUserSessions = async (limit = 10) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("session_history")
    .select("companions:companion_id (*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data.map(({ companions }) => companions);
};

export const getUserCompanions = async () => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("author", user.id);
  if (error) throw new Error(error.message);
  return data;
};

export const newCompanionPermissions = async () => {
  // TODO: Implement plan/feature check logic for Supabase if needed
  // For now, just allow unlimited
  return true;
};

// Bookmarks
export const addBookmark = async (companionId: string, path: string) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) return;
  const { data, error } = await supabase.from("bookmarks").insert({
    companion_id: companionId,
    user_id: user.id,
  });
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

export const removeBookmark = async (companionId: string, path: string) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) return;
  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("companion_id", companionId)
    .eq("user_id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  revalidatePath(path);
  return data;
};

export const getBookmarkedCompanions = async () => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("bookmarks")
    .select("companions:companion_id (*)")
    .eq("user_id", user.id);
  if (error) {
    throw new Error(error.message);
  }
  return data.map(({ companions }) => companions);
};
