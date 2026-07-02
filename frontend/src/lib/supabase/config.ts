// Public Supabase config. These are safe to commit — the anon key is designed to be
// exposed in the browser (it's shipped to every client), and access is gated by RLS.
// Hardcoded on purpose: pasting these into the Vercel dashboard repeatedly corrupted
// the anon key with smart-quote characters, breaking auth. Secret keys (service role,
// Notion token) stay in environment variables — never hardcode those.
export const SUPABASE_URL = "https://uagvazsyjjulsiinvuot.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZ3ZhenN5amp1bHNpaW52dW90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExMDEwMjAsImV4cCI6MjA5NjY3NzAyMH0.M9BDZOujlpOOaaDzLc3tR0CuluADZvQtmwwy7BcG6zo";
