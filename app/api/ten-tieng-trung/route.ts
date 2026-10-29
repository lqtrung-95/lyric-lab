import { convertName, joinHan } from "@/lib/names/chinese-name";
import { SURNAME_PINYIN } from "@/lib/names/name-data";
import { lookupTermEntry } from "@/lib/lookup/server-lookup";

export const runtime = "nodejs";

/**
 * POST /api/ten-tieng-trung {name} → tên Hán gợi ý kèm pinyin từng chữ. Chữ Hán và nghĩa lấy từ bảng gợi ý (lib/names), pinyin tra từ ĐIỂN (quy tắc 2).
 * Dùng POST để tên người dùng không nằm trong URL và nhật ký truy cập. Lỗi tra từ điển thì chữ đó thiếu pinyin (giao diện vẫn hiện chữ Hán).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: unknown } | null;
  const parts = typeof body?.name === "string" ? convertName(body.name) : [];
  if (parts.length === 0) return Response.json({ error: "bad_name" }, { status: 400 });
  const withPinyin = await Promise.all(parts.map(async (p) => {
    if (!p.han) return { ...p, pinyin: null };
    if (p.role === "surname" && SURNAME_PINYIN[p.han]) return { ...p, pinyin: SURNAME_PINYIN[p.han] };
    const entry = await lookupTermEntry(p.han).catch(() => null);
    return { ...p, pinyin: entry?.pinyin ?? null };
  }));
  return Response.json({ parts: withPinyin, han: joinHan(parts), pinyin: withPinyin.every((p) => p.pinyin) ? withPinyin.map((p) => p.pinyin).join(" ") : null }, { headers: { "Cache-Control": "no-store" } });
}
