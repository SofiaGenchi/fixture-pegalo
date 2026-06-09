import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseAnon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabaseAnon.from("profiles").update({ username: "test" }).eq("id", "00000000-0000-0000-0000-000000000000");
  console.log("ANON UPDATE ERROR:", error);
}

run();
