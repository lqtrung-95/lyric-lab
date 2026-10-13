import { getChatStatus } from "@/lib/chat/chat-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → {latestId, announcement}: chấm "có tin mới" trên thanh trên và banner thông báo mới nhất (công khai; CDN giữ 20 giây vì mỗi tab hỏi định kỳ). */
export async function GET() {
  try {
    return Response.json(await getChatStatus(), { headers: { "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "chat_status_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500, headers: { "Cache-Control": "private, no-store" } });
  }
}
