import "server-only";
import { revalidateTag } from "next/cache";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { EXPLAIN_LANG, LEARN_LANG } from "./analyze-video";
import type { SongAnalysis } from "./analysis-types";
import { PROMPT_VERSION } from "./build-analysis-prompt";
import { buildLinePinyin, withSubwordEntries } from "./build-line-pinyin";
import { applyLineEdit } from "./edit-analysis-line";
import { tokenizeLyricLines } from "./tokenize-lyric-lines";

const HAN = /\p{Script=Han}/u;
export const MAX_LINE_TEXT = 200;
export const MAX_LINE_PINYIN = 300;
export const MAX_LINE_TRANSLATION = 300;

export type EditLineResult = "ok" | "analysis_not_found" | "line_not_found" | "invalid_text";

export interface EditLineInput {
  lineIndex: number;
  text: string;
  /** Pinyin do quản trị viên gõ tay; không có thì tính lại từ chữ Hán bằng từ điển (quy tắc: pinyin lấy từ từ điển, không lấy từ LLM). */
  pinyin?: string;
  translation?: string;
}

/**
 * Quản trị viên sửa lời của một dòng trong bản phân tích hiện hành của bài: chữ Hán mới được tách từ lại (jieba) và pinyin tính lại từ từ điển trừ khi có
 * pinyin gõ tay. Mốc thời gian giữ nguyên. Xóa lời giải thích câu đã lưu của dòng đó vì không còn đúng với chữ mới. Cache phân tích của Next được làm mới ngay.
 */
export async function editSongLine(videoId: string, input: EditLineInput): Promise<EditLineResult> {
  const text = input.text.trim();
  if (!text || text.length > MAX_LINE_TEXT || !HAN.test(text)) return "invalid_text";

  const sb = createSupabaseServiceClient();
  const key = { video_id: videoId, learn_lang: LEARN_LANG, explain_lang: EXPLAIN_LANG, prompt_version: PROMPT_VERSION };
  const { data: row } = await sb.from("song_analyses").select("analysis").match(key).maybeSingle();
  if (!row) return "analysis_not_found";
  const analysis = row.analysis as SongAnalysis;
  const line = analysis.lines.find((l) => l.index === input.lineIndex);
  if (!line) return "line_not_found";

  const [tokenized] = tokenizeLyricLines([{ index: line.index, text, simplified: toSimplifiedChinese(text), start: line.start, end: line.end, hasHan: true }]);
  const tokens = tokenized.tokens.map((t) => ({ text: t.text, simplified: t.simplified }));
  let pinyin = input.pinyin?.trim();
  if (!pinyin) {
    const lookup = (terms: string[]) => lookupWords(sb as never, terms);
    const hanTerms = tokens.filter((t) => HAN.test(t.simplified)).map((t) => t.simplified);
    pinyin = buildLinePinyin(tokens, await withSubwordEntries(lookup, await lookup(hanTerms), hanTerms));
  }

  const updated = applyLineEdit(analysis, { lineIndex: input.lineIndex, text, tokens, pinyin, translation: input.translation });
  if (!updated) return "line_not_found";
  const { error } = await sb.from("song_analyses").update({ analysis: updated }).match(key);
  if (error) throw new Error(`song_analyses: ${error.message}`);

  await sb.from("line_explanations").delete().eq("video_id", videoId).eq("line_index", input.lineIndex);
  // Bản phân tích được cache 1 giờ trong Next: làm mới ngay để người dùng (kể cả admin vừa sửa) thấy bản mới.
  revalidateTag("song-analysis", { expire: 0 });
  return "ok";
}
