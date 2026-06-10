import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// A key is considered "secret" if it starts with sb_secret_ or contains "secret"
const isSecretKey = !!(supabaseAnonKey && (supabaseAnonKey.startsWith("sb_secret_") || supabaseAnonKey.includes("secret")));

// On the client, we cannot use secret keys. On the server, we can.
const isValidConfig = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  (typeof window === "undefined" || !isSecretKey)
);

export const isSupabaseConfigured = isValidConfig;

if (typeof window !== "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "⚠️ Supabase credentials are not configured in environment variables. Falling back to Mock LocalStorage mode."
    );
  } else if (isSecretKey) {
    console.warn(
      "⚠️ Security Alert: A secret service_role key was provided as NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "To prevent exposing your DB admin credentials to the client, client-side Supabase operations have been disabled " +
      "and will fall back to LocalStorage mock mode. SSR pages will still load data securely from the database."
    );
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : (null as any);

