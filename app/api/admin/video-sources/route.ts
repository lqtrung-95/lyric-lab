import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { parseSourcePatch } from "@/lib/video/video-discovery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUMNS = "id, youtube_ref, title, owned, license_note, watching, created_at";

/** GET → {sources: [{id, channelId, title, owned, licenseNote, watching, videoCount}]}; 409 {error: "migration_missing"} khi chưa có cột `watching`. Chỉ quản trị viên. */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const sb = createSupabaseServiceClient();
  const [sources, lessons] = await Promise.all([
    sb.from("video_sources").select(COLUMNS).order("created_at", { ascending: false }),
    sb.from("video_lessons").select("source_id"),
  ]);
  if (sources.error) {
    console.error(JSON.stringify({ event: "video_sources_list_error", message: sources.error.message }));
    return sources.error.code === "42703" ? Response.json({ error: "migration_missing" }, { status: 409 }) : Response.json({ error: "server_error" }, { status: 500 });
  }
  const counts = new Map<string, number>();
  for (const l of lessons.data ?? []) if (l.source_id) counts.set(l.source_id as string, (counts.get(l.source_id as string) ?? 0) + 1);
  return Response.json({
    sources: sources.data.map((s) => ({
      id: s.id, channelId: s.youtube_ref, title: s.title, owned: s.owned, licenseNote: s.license_note, watching: s.watching, videoCount: counts.get(s.id) ?? 0,
    })),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

/** PATCH {id, watching?, licenseNote?} → bật/tắt theo dõi hoặc sửa ghi chú giấy phép của một kênh. Chỉ quản trị viên. */
export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const patch = parseSourcePatch(body);
  if (typeof body?.id !== "string" || !UUID.test(body.id) || !patch) return Response.json({ error: "invalid_request" }, { status: 400 });

  const { error } = await createSupabaseServiceClient().from("video_sources").update({
    ...(patch.watching !== undefined ? { watching: patch.watching } : {}),
    ...(patch.licenseNote !== undefined ? { license_note: patch.licenseNote } : {}),
  }).eq("id", body.id);
  if (error) {
    console.error(JSON.stringify({ event: "video_sources_patch_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true });
}
