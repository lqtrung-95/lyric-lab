import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { deleteMessage } from "@/lib/chat/chat-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "private, no-store" };

/** DELETE ?block=1 → quản trị xóa một tin (xóa mềm), kèm chặn người gửi nếu `block=1`. Lỗi: 400 invalid_id, 403 forbidden, 404 not_found, 500 server_error. */
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d{1,15}$/.test(id)) return Response.json({ error: "invalid_id" }, { status: 400, headers: NO_STORE });
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403, headers: NO_STORE });
  try {
    const result = await deleteMessage(Number(id), new URL(req.url).searchParams.get("block") === "1");
    if (result === "not_found") return Response.json({ error: "not_found" }, { status: 404, headers: NO_STORE });
    return Response.json({ done: "deleted" }, { headers: NO_STORE });
  } catch (error) {
    console.error(JSON.stringify({ event: "chat_delete_error", id, message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500, headers: NO_STORE });
  }
}
