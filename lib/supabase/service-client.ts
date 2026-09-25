import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server-env";

// Client dùng service role (bỏ qua RLS): chỉ dùng ở server cho cache và nạp dữ liệu, tuyệt đối không đưa xuống client.
export function createSupabaseServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getServerEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}
