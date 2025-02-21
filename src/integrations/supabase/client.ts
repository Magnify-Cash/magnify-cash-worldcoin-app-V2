
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase/database';

const SUPABASE_URL = "https://npqctynrdzopspxhtpwa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcWN0eW5yZHpvcHNweGh0cHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMTYzODAsImV4cCI6MjA1MjU5MjM4MH0.R9q4-yIPcI7zm9YJQcfNuOEE7z7BF_nt9d2DXKWlBb8";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
