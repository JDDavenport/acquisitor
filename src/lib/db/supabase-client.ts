import { createClient } from "@supabase/supabase-js";

// Extract Supabase URL and key from DATABASE_URL or use direct config
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
  process.env.DATABASE_URL?.includes('supabase') ? 'https://' + process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] : '';

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log("[DB] Using Supabase client");
console.log("[DB] URL:", supabaseUrl ? "configured" : "missing");
console.log("[DB] Key:", supabaseKey ? "configured" : "missing");

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Mock db interface for Better Auth compatibility
export const db = {
  query: {
    user: {
      findFirst: async () => {
        const { data, error } = await supabase.from('user').select('*').limit(1).single();
        if (error) throw error;
        return data;
      },
    },
  },
  // Add other methods as needed
};