import type { LrclibItem } from "./lyrics-types";

const BASE_URL = "https://lrclib.net/api/search";
const TIMEOUT_MS = 10_000;

export interface LrclibSearch {
  search(query: string): Promise<LrclibItem[]>;
}

/** Client API tìm kiếm công khai của LRCLIB (không cần khóa). Lỗi mạng/HTTP được ném ra để bên gọi ghi nhận. */
export class LrclibProvider implements LrclibSearch {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async search(query: string): Promise<LrclibItem[]> {
    const url = new URL(BASE_URL);
    url.searchParams.set("q", query);
    const res = await this.fetchFn(url, {
      headers: { "User-Agent": "lyric-lab (personal project)" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`LRCLIB lỗi HTTP ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("LRCLIB trả dữ liệu không đúng định dạng");
    return data.map((d) => ({
      id: d.id,
      trackName: String(d.trackName ?? ""),
      artistName: String(d.artistName ?? ""),
      duration: Number(d.duration ?? 0),
      instrumental: Boolean(d.instrumental),
      syncedLyrics: typeof d.syncedLyrics === "string" ? d.syncedLyrics : null,
    }));
  }
}
