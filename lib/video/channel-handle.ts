import { CaptionError } from "@/lib/captions/caption-errors";

/**
 * Chuẩn hóa ô nhập kênh YouTube thành tên kênh (handle) để tra: nhận "ChineseGlow", "@ChineseGlow" hoặc đường dẫn
 * "https://www.youtube.com/@ChineseGlow/videos". Null khi không nhận ra (chỉ nhận chữ, số, gạch dưới, gạch ngang, dấu chấm).
 */
export function normalizeChannelHandle(input: string): string | null {
  let text = input.trim();
  const fromUrl = text.match(/youtube\.com\/@([^/?#\s]+)/i);
  if (fromUrl) text = fromUrl[1];
  text = text.replace(/^@/, "");
  return /^[\w.-]{3,100}$/.test(text) ? text : null;
}

/**
 * Lỗi tạm khi tải phụ đề (YouTube chặn 429, đòi đăng nhập "Sign in to confirm you're not a bot" từ IP cloud, hoặc đứt kết nối): đáng nghỉ rồi thử lại,
 * và hàng đợi nạp dừng sớm khi liên tiếp gặp lỗi này. Khác với lỗi cố định như video không có phụ đề.
 */
export const isTransientCaptionError = (error: unknown): boolean =>
  (error instanceof CaptionError && error.type === "blocked") || /429|Tải caption thất bại/.test((error as Error)?.message ?? "");
