export type DiscoverSort = "new" | "popular";
export const DISCOVER_PAGE_SIZE = 24;

export interface DiscoverParams {
  sort: DiscoverSort;
  /** Dải cấp HSK trung bình của bài, hoặc null nếu không lọc. */
  band: [number, number] | null;
  query: string;
  offset: number;
}

const BANDS: Record<string, [number, number]> = { "1-2": [0, 2.5], "3-4": [2.5, 4.5], "5-6": [4.5, 6.5], "7": [6.5, 99] };

/** Đọc tham số từ URL, kẹp về giá trị hợp lệ (không tin đầu vào của client). */
export function parseDiscoverParams(sp: URLSearchParams): DiscoverParams {
  const sort: DiscoverSort = sp.get("sort") === "popular" ? "popular" : "new";
  const offset = Math.max(0, Math.min(2000, Math.floor(Number(sp.get("offset")) || 0)));
  // Bỏ ký tự đặc biệt của ilike (% _ \) và giới hạn độ dài để từ khóa không thành mẫu tìm kiếm tùy ý.
  const query = (sp.get("q") ?? "").replace(/[%_\\,()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
  return { sort, band: BANDS[sp.get("band") ?? ""] ?? null, query, offset };
}

export interface DiscoverSong {
  videoId: string;
  title: string;
  channelTitle: string;
  levelAvg: number | null;
  listeners: number;
}
