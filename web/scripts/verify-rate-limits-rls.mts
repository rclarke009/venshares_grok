/**
 * Confirms anon cannot INSERT into public.rate_limits (migration 003).
 * Run from the web directory with .env.local present:
 *   npm run verify:rate-limits-rls
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY (load .env.local from web/).",
  );
  process.exit(1);
}

const supabase = createClient(url, anonKey);

const { data, error } = await supabase
  .from("rate_limits")
  .insert({ ip_address: "rls-verify-script" })
  .select("id")
  .maybeSingle();

if (!error) {
  console.error(
    "FAIL: anon was able to insert into rate_limits. RLS may not be locked down (migration 003).",
    data,
  );
  process.exit(1);
}

console.log("OK: anon insert blocked as expected:", error.message);
process.exit(0);
