import "server-only";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { getServerEnv } from "@/lib/env/server-env";

// Client dùng service role (bỏ qua RLS): chỉ dùng ở server cho cache và nạp dữ liệu, tuyệt đối không đưa xuống client.
// `ws` làm transport realtime để chạy được trên Node 20 (Node 22+ có WebSocket gốc); app không dùng realtime.
export function createSupabaseServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, getServerEnv().SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    realtime: { transport: ws as never },
  });
}
