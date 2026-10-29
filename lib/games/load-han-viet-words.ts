import "server-only";
import { getHskRows } from "@/lib/tools/hsk-vocab";
import { hanVietWordsFrom, type HanVietWord } from "./han-viet-words";

const LEVELS = [2, 3, 4, 5] as const;

/** Kho từ cho game Hán Việt: HSK 2–5 (từ hai chữ có âm Hán Việt và nghĩa Việt). Lỗi tải một cấp thì bỏ cấp đó, không làm hỏng cả trang. */
export async function loadHanVietWords(): Promise<HanVietWord[]> {
  const perLevel = await Promise.all(LEVELS.map((l) => getHskRows(l).then((rows) => hanVietWordsFrom(rows, l), () => [] as HanVietWord[])));
  return perLevel.flat();
}
