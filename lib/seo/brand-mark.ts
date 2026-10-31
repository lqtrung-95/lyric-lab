import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";

let cached: string | null | undefined;

/**
 * Logo SongHanzi (ô cam viền mực, chữ 歌) dưới dạng data URL để đưa vào ảnh xem trước dựng ở server (satori). Đọc một lần rồi nhớ; lỗi đọc thì trả null
 * (ảnh xem trước vẫn dựng được, chỉ thiếu logo). Mọi ảnh chia sẻ dựng ở server phải dùng chung hàm này để cùng một logo.
 */
export async function loadBrandMarkDataUrl(): Promise<string | null> {
  if (cached !== undefined) return cached;
  try {
    const buf = await readFile(path.join(process.cwd(), "public", "songhanzi-mark.png"));
    cached = `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    cached = null;
  }
  return cached;
}
