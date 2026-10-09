import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Lấy phụ đề tiếng Trung có sẵn của video YouTube qua dịch vụ Supadata (chạy trên IP của họ nên không bị YouTube chặn như server của ta).
// Chỉ lấy bản có sẵn (`mode=native`, 1 credit mỗi video), không dùng chế độ tự nhận dạng giọng nói (tính theo phút, đắt hơn nhiều).
// https://docs.supadata.ai/youtube/get-transcript
const ENDPOINT = "https://api.supadata.ai/v1/transcript";

/** Lỗi gọi Supadata. `status` là mã HTTP; 402/429 nghĩa là hết credit hoặc bị giới hạn tốc độ. */
export class SupadataError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
    this.name = "SupadataError";
  }
}

interface SupadataResponse {
  lang?: string;
  content?: { text?: string; offset?: number; duration?: number; lang?: string }[] | string;
}

/**
 * Các dòng phụ đề tiếng Trung của video; mảng rỗng khi video không có phụ đề tiếng Trung (HTTP 206 hoặc ngôn ngữ trả về không phải tiếng Trung).
 * Ném `SupadataError` khi lỗi khác (hết credit, sai khóa, video riêng tư...).
 */
export async function fetchSupadataChineseLines(videoId: string, apiKey: string, fetchFn: typeof fetch = fetch): Promise<CaptionLine[]> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("url", `https://www.youtube.com/watch?v=${videoId}`);
  url.searchParams.set("lang", "zh");
  url.searchParams.set("text", "false");
  url.searchParams.set("mode", "native");
  const res = await fetchFn(url, { headers: { "x-api-key": apiKey }, signal: AbortSignal.timeout(25_000) });
  if (res.status === 206) return [];
  if (!res.ok) throw new SupadataError(res.status, `Supadata ${res.status}`);
  const body = (await res.json()) as SupadataResponse;
  if (!Array.isArray(body.content) || !(body.lang ?? "").toLowerCase().startsWith("zh")) return [];
  return body.content
    .filter((s) => typeof s.text === "string" && s.text.trim() && typeof s.offset === "number")
    .map((s) => ({ text: s.text!.trim(), start: s.offset! / 1000, end: (s.offset! + (s.duration ?? 0)) / 1000 }));
}
