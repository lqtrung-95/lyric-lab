import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { isSingleHan } from "./han-char";

// `turbopackIgnore`: đường dẫn dựng lúc chạy; không cho bộ dựng quét ~9,5 nghìn tệp vào bundle (việc kèm tệp khi deploy do `outputFileTracingIncludes` trong next.config.ts đảm nhiệm).
const DATA_DIR = path.join(/* turbopackIgnore: true */ process.cwd(), "node_modules", "hanzi-writer-data");

/**
 * Dữ liệu nét của một chữ (JSON của hanzi-writer-data, dựa trên Make Me a Hanzi, giấy phép Arphic Public License) hoặc null nếu gói không có chữ này.
 * Đọc nguyên văn từ gói đã cài (không sao chép vào repo) để giữ nguyên tệp giấy phép đi kèm.
 */
export async function readStrokeData(char: string): Promise<string | null> {
  if (!isSingleHan(char)) return null;
  try { return await readFile(path.join(/* turbopackIgnore: true */ DATA_DIR, `${char}.json`), "utf8"); } catch { return null; }
}
