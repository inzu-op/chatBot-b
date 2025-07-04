import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Export a function to create a new client
export const createClient = () => createSupabaseClient(supabaseUrl, supabaseServiceKey)

// Export a single, memoized client instance
export const supabase = createClient()
