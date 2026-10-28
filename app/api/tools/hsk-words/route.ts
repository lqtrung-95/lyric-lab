import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { isHskLevel } from "@/lib/tools/build-hsk-rows";
import { clampSample, sampleHskWords, toWorksheetLine } from "@/lib/tools/hsk-sample";
import { getHskRows } from "@/lib/tools/hsk-vocab";

export const runtime = "nodejs";

// Công cụ công khai, chỉ đọc từ điển đã nhớ sẵn (không gọi AI); giới hạn thô theo IP chỉ để chặn lạm dụng.
const limiter = new InMemoryRateLimiter(60, 60 * 60 * 1000);

/** GET /api/tools/hsk-words?level=1..6&count=5..20 → {lines: string[]}: các dòng "chữ Hán, nghĩa tiếng Anh" lấy ngẫu nhiên từ một cấp HSK, để nạp vào tờ bài tập từ vựng. */
export async function GET(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });
  const params = new URL(req.url).searchParams;
  const level = Number(params.get("level"));
  if (!isHskLevel(level)) return Response.json({ error: "invalid_level" }, { status: 400 });
  try {
    const words = sampleHskWords(await getHskRows(level), clampSample(params.get("count")));
    return Response.json({ lines: words.map(toWorksheetLine) });
  } catch (error) {
    console.error(JSON.stringify({ event: "hsk_words_error", message: (error as Error).message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
