import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** PATCH { action: "approve" | "reject" } → duyệt góp ý cho hiện ở trang công khai, hoặc từ chối (vẫn giữ lại, chỉ không hiện). */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const feedbackId = Number(id);
  if (!Number.isInteger(feedbackId)) return Response.json({ error: "invalid_id" }, { status: 400 });

  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  if (body?.action !== "approve" && body?.action !== "reject") return Response.json({ error: "invalid_action" }, { status: 400 });

  const status = body.action === "approve" ? "approved" : "rejected";
  const { error } = await createSupabaseServiceClient().from("feedback").update({ status }).eq("id", feedbackId).eq("status", "pending");
  if (error) return Response.json({ error: "server_error" }, { status: 500 });
  return Response.json({ done: body.action });
}
