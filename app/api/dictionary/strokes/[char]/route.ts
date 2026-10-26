import { isSingleHan } from "@/lib/tra-tu/han-char";
import { readStrokeData } from "@/lib/tra-tu/stroke-data";

export const runtime = "nodejs";

/** GET /api/dictionary/strokes/爱 → dữ liệu nét (hanzi-writer) của một chữ Hán; 404 nếu không có. Dữ liệu tĩnh nên cho nhớ đệm lâu. */
export async function GET(_req: Request, { params }: { params: Promise<{ char: string }> }) {
  const char = decodeURIComponent((await params).char);
  if (!isSingleHan(char)) return Response.json({ error: "invalid_char" }, { status: 400 });
  const body = await readStrokeData(char);
  if (!body) return Response.json({ error: "not_found" }, { status: 404 });
  return new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=2592000, immutable" } });
}
