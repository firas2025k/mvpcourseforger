// app/actions/search.ts
"use server";

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase'; 

/**
 * Server action to search for courses by title for the currently authenticated user.
 * @param query The search query string.
 * @returns A promise that resolves to an array of courses matching the query.
 */
export async function searchCourses(query: string): Promise<{ id: string; title:string; }[]> {
    // Return empty array if the query is too short to avoid unnecessary DB calls
    if (!query || query.length < 2) {
        return [];
    }

    const cookieStore = cookies();
    const supabase = createServerClient<Database>(
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
    
    // Get the current user session
    const { data: { user } } = await supabase.auth.getUser();

    // If no user is authenticated, return an empty array
    if (!user) {
        console.warn("Search attempt without authenticated user.");
        return [];
    }
    
    // Fetch courses that belong to the user and match the search query
    const { data, error } = await supabase
        .from('courses')
        .select('id, title')
        .eq('user_id', user.id)
        .ilike('title', `%${query}%`) // Case-insensitive search
        .limit(10); // Limit results for performance

    if (error) {
        console.error("Error searching courses:", error.message);
        return []; // Return empty array on error
    }

    return data || [];
}
