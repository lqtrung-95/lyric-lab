// Tìm video ứng viên và quản lý kênh theo dõi cho kho Video luyện nghe (VD-04). Chỉ có hàm thuần để dễ test; việc gọi mạng nằm ở `youtube-data-api.ts`.

export const SEARCH_DURATIONS = ["medium", "long"] as const;
export type SearchDuration = (typeof SEARCH_DURATIONS)[number];

export const MAX_SEARCH_QUERY = 100;

/** Từ khóa tìm: bỏ khoảng trắng thừa; null khi rỗng hoặc quá dài. */
export function normalizeSearchQuery(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const q = input.replace(/\s+/g, " ").trim();
  return q.length > 0 && q.length <= MAX_SEARCH_QUERY ? q : null;
}

/**
 * Tham số cho `search.list`: chỉ video giấy phép Creative Commons, có phụ đề (closedCaption gồm cả phụ đề tự động nên bước nạp vẫn phải kiểm
 * track `manual`), nhúng được, ưu tiên tiếng Trung. Mỗi lần gọi tốn 100 đơn vị hạn mức hằng ngày (mặc định 10.000).
 */
export function buildCcSearchParams(query: string, opts: { duration?: SearchDuration; pageToken?: string } = {}): Record<string, string> {
  return {
    part: "id", type: "video", q: query, maxResults: "50", order: "relevance",
    videoLicense: "creativeCommon", videoCaption: "closedCaption", videoEmbeddable: "true",
    relevanceLanguage: "zh", videoDuration: opts.duration ?? "medium",
    ...(opts.pageToken ? { pageToken: opts.pageToken } : {}),
  };
}

/** Hết hạn mức hằng ngày của YouTube Data API (403 quotaExceeded). */
export const isQuotaError = (error: unknown): boolean => /quota/i.test((error as Error)?.message ?? "");

export interface SourcePatch {
  watching?: boolean;
  licenseNote?: string | null;
}

const MAX_LICENSE_NOTE = 300;

/** Kiểm body PATCH của kênh nguồn: chỉ nhận `watching` (boolean) và `licenseNote` (chuỗi ≤ 300 ký tự, rỗng = xóa). Null khi sai hoặc không có gì để sửa. */
export function parseSourcePatch(body: unknown): SourcePatch | null {
  if (typeof body !== "object" || body === null) return null;
  const { watching, licenseNote } = body as Record<string, unknown>;
  const patch: SourcePatch = {};
  if (watching !== undefined) {
    if (typeof watching !== "boolean") return null;
    patch.watching = watching;
  }
  if (licenseNote !== undefined) {
    if (licenseNote !== null && typeof licenseNote !== "string") return null;
    const note = (licenseNote ?? "").trim();
    if (note.length > MAX_LICENSE_NOTE) return null;
    patch.licenseNote = note === "" ? null : note;
  }
  return Object.keys(patch).length > 0 ? patch : null;
}
