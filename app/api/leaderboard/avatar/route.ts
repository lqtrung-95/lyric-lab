import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

const AVATAR_BUCKET = "avatars";
const MAX_BYTES = 2 * 1024 * 1024; // 2MB, đủ cho ảnh đại diện vuông nhỏ
const ALLOWED: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

/** POST multipart/form-data { file } → tải avatar lên, chỉ áp dụng khi đã có hồ sơ bảng xếp hạng (đã đặt biệt danh). */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return Response.json({ error: "invalid_request" }, { status: 400 });
  const ext = ALLOWED[file.type];
  if (!ext) return Response.json({ error: "unsupported_type" }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "too_large" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const { data: profile } = await sb.from("leaderboard_profiles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!profile) return Response.json({ error: "profile_required" }, { status: 404 });

  const path = `${user.id}/avatar.${ext}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: uploadError } = await sb.storage.from(AVATAR_BUCKET).upload(path, bytes, { contentType: file.type, upsert: true });
  if (uploadError) {
    console.error(JSON.stringify({ event: "avatar_upload_error", message: uploadError.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }

  // Ảnh có thể đổi ở cùng đường dẫn: thêm mốc thời gian để trình duyệt không dùng ảnh cache cũ.
  const { data: pub } = sb.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${pub.publicUrl}?v=${Date.now()}`;

  const { error: updateError } = await sb.from("leaderboard_profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
  if (updateError) return Response.json({ error: "server_error" }, { status: 500 });
  return Response.json({ avatarUrl });
}
