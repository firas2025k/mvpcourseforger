"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
// import type { Database } from '../types/supabase'; // Uncomment if you have a Database type
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

// FIXED: Now only returns companions created by the authenticated user
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
  const { supabase, user } = await getSupabaseAndUser();
  
  // SECURITY FIX: Ensure user is authenticated
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY FIX: Filter by author (current user) to only show user's own companions
  let query = supabase.from("companions").select().eq("author", user.id);
  
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
  const { supabase, user } = await getSupabaseAndUser();
  
  // SECURITY FIX: Ensure user is authenticated
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY FIX: Only allow access to companions created by the current user
  const { data, error } = await supabase
    .from("companions")
    .select()
    .eq("id", id)
    .eq("author", user.id); // Only return if user is the author
    
  if (error) {
    console.log(error);
    throw new Error(error.message);
  }
  
  // Return null if no companion found (user doesn't own it or it doesn't exist)
  return data?.[0] || null;
};


export async function deleteCompanion(companionId: string, pathname: string) {
  const { supabase, user } = await getSupabaseAndUser();

  // Get the current user
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    redirect("/dashboard/voice");
  }

  try {
    // Verify the companion belongs to the current user before deleting
    const { data: companion, error: fetchError } = await supabase
      .from("companions")
      .select("id, author")
      .eq("id", companionId)
      .single();

    if (fetchError) {
      throw new Error("Companion not found");
    }

    if (companion.author !== authUser.id) {
      throw new Error("Unauthorized: You can only delete your own companions");
    }

    // Delete associated session history
    const { error: deleteSessionHistoryError } = await supabase
      .from("session_history")
      .delete()
      .eq("companion_id", companionId);

    if (deleteSessionHistoryError) {
      throw new Error(`Failed to delete session history: ${deleteSessionHistoryError.message}`);
    }

    // Delete the companion
    const { error: deleteError } = await supabase
      .from("companions")
      .delete()
      .eq("id", companionId)
      .eq("author", authUser.id); // Double-check authorization

    if (deleteError) {
      throw new Error(`Failed to delete companion: ${deleteError.message}`);
    }

    // Revalidate the current path to update the UI
    revalidatePath(pathname);
    
    return { success: true, message: "Voice agent deleted successfully" };
  } catch (error) {
    console.error("Error deleting companion:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to delete voice agent" 
    };
  }
}
export const addToSessionHistory = async (companionId: string, duration: number) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY CHECK: Verify the companion belongs to the user before adding session history
  const { data: companion, error: companionError } = await supabase
    .from("companions")
    .select("id")
    .eq("id", companionId)
    .eq("author", user.id)
    .single();
    
  if (companionError || !companion) {
    throw new Error("Companion not found or access denied");
  }
  
  const { data, error } = await supabase.from("session_history").insert({
    companion_id: companionId,
    user_id: user.id,
    duration: duration,
  });
  if (error) throw new Error(error.message);
  return data;
};

export const getRecentSessions = async (limit = 10) => {
  const { supabase, user } = await getSupabaseAndUser();
  
  // SECURITY FIX: Ensure user is authenticated
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY FIX: Only return sessions for companions owned by the current user
  const { data, error } = await supabase
    .from("session_history")
    .select(`
      companions:companion_id (
        id,
        name,
        subject,
        topic,
        author
      )
    `)
    .eq("user_id", user.id) // Only user's own sessions
    .order("created_at", { ascending: false })
    .limit(limit);
    
  if (error) throw new Error(error.message);
  
  // Filter out any sessions where the companion is null or not owned by user
  return data
    .filter(({ companions }) => companions && companions.author === user.id)
    .map(({ companions }) => companions);
};

export const getUserSessions = async (limit = 10) => {
  const { supabase, user } = await getSupabaseAndUser();
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY FIX: Only return sessions for companions owned by the current user
  const { data, error } = await supabase
    .from("session_history")
    .select(`
      companions:companion_id (
        id,
        name,
        subject,
        topic,
        author
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit);
    
  if (error) throw new Error(error.message);
  
  // Filter out any sessions where the companion is null or not owned by user
  return data
    .filter(({ companions }) => companions && companions.author === user.id)
    .map(({ companions }) => companions);
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
  if (!user) throw new Error("Not authenticated");
  
  // SECURITY CHECK: Verify the companion exists and belongs to the user
  const { data: companion, error: companionError } = await supabase
    .from("companions")
    .select("id")
    .eq("id", companionId)
    .eq("author", user.id)
    .single();
    
  if (companionError || !companion) {
    throw new Error("Companion not found or access denied");
  }
  
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
  if (!user) throw new Error("Not authenticated");
  
  // Only remove bookmarks for the current user
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
  
  // SECURITY FIX: Only return bookmarked companions that belong to the current user
  const { data, error } = await supabase
    .from("bookmarks")
    .select(`
      companions:companion_id (
        id,
        name,
        subject,
        topic,
        author,
        voice,
        style,
        duration,
        created_at
      )
    `)
    .eq("user_id", user.id);
    
  if (error) {
    throw new Error(error.message);
  }
  
  // Filter out any bookmarks where the companion is null or not owned by user
  return data
    .filter(({ companions }) => companions && companions.author === user.id)
    .map(({ companions }) => companions);
};

