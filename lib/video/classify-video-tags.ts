import type { ChatFn } from "@/lib/analysis/groq-chat";
import { heuristicTags, normalizeTags, VIDEO_TAGS, type VideoTagId } from "./video-tags";

// Nhờ AI gán 1-3 thẻ chủ đề cho video từ tên, kênh và vài câu thoại đầu. Dùng tên model cụ thể (không `-latest`); lỗi hay kết quả rỗng thì quay về quy tắc từ khóa. Không bao giờ ném lỗi:
// thẻ chỉ là thông tin phụ, không được làm hỏng việc nạp video.
const MODELS = ["gemini:gemini-3-flash-preview", "gemini:gemini-2.5-flash"];
const SAMPLE_LINES = 12;
// Tổng thời gian tối đa cho cả hai model: bước này chạy sau khi ghi bài trong route 60 giây (đã có dịch AI), không được kéo dài quá.
const DEADLINE_MS = 10_000;

const tagHint: Record<VideoTagId, string> = {
  "hoat-hinh": "animation / cartoon (drawn or 3D animated characters)",
  vlog: "personal video diary, a creator filming their own days",
  "doi-song": "everyday life, daily routines, home, relationships, workplace",
  "du-lich": "travel, trips, sightseeing, city walks",
  hai: "comedy, funny sketches, humor-first content",
  "thieu-nhi": "made for young children (nursery, toddlers, preschool shows)",
  "phim-ngan": "scripted short film or drama with actors/characters and a plot",
  podcast: "talk/interview/podcast, mostly people speaking",
};

const SYSTEM = `You label Chinese-language learning videos with topic tags. Choose 1 to 3 tags ONLY from this list (use the ids exactly):
${VIDEO_TAGS.map((t) => `- ${t.id}: ${tagHint[t.id]}`).join("\n")}
Reply with JSON only: {"tags": ["id", ...]}. Prefer the most specific tags; never invent new ones.`;

export interface TagContext { title: string; channelTitle: string; lines: string[] }

export async function classifyVideoTags(chat: ChatFn, ctx: TagContext): Promise<VideoTagId[]> {
  const user = `Title: ${ctx.title.slice(0, 200)}\nChannel: ${ctx.channelTitle.slice(0, 100)}\nFirst spoken lines:\n${ctx.lines.slice(0, SAMPLE_LINES).join("\n").slice(0, 800)}`;
  const deadline = Date.now() + DEADLINE_MS;
  for (const model of MODELS) {
    const remaining = deadline - Date.now();
    if (remaining < 1000) break;
    try {
      const raw = await chat({ model, system: SYSTEM, user, maxTokens: 120, timeoutMs: remaining });
      const tags = normalizeTags((JSON.parse(raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")) as { tags?: unknown }).tags);
      if (tags.length > 0) return tags;
    } catch {
      // Model này lỗi/trả JSON hỏng: thử model kế, hết thì dùng quy tắc từ khóa.
    }
  }
  return heuristicTags(ctx.title, ctx.channelTitle);
}
