import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If the keys are missing the app should say so plainly rather than failing
// with an unreadable network error.
export const configured = Boolean(url && key);

export const supabase = configured ? createClient(url, key) : null;
