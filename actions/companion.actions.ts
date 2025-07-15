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
  const author = user.id;
  // Restore 'duration' if present in formData
  const { duration, ...formDataWithoutDuration } = formData;
  const insertData = { ...formDataWithoutDuration, author };
  if (duration !== undefined) insertData.duration = duration;
  const { data, error } = await supabase
    .from("companions")
    .insert(insertData)
    .select();
  if (error || !data)
    throw new Error(error?.message || "Failed to create a companion");
  return data[0];
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
