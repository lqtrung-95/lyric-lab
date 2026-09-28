import { weapiEncrypt } from "./netease-weapi-crypto";
import type { LrclibItem } from "./lyrics-types";

// API không chính thức của NetEase Cloud Music (网易云音乐), dùng như LRCLIB nhưng cần mã hoá tham số theo giao thức
// `weapi` của họ (xem netease-weapi-crypto.ts) mới được server chấp nhận. Kho nhạc Hoa lớn, nhiều bài LRCLIB không có.
// Không cần khóa, nhưng địa chỉ/định dạng/yêu cầu mã hoá có thể đổi không báo trước.
const SEARCH_URL = "https://music.163.com/weapi/search/get";
const LYRIC_URL = "https://music.163.com/weapi/song/lyric";
const TIMEOUT_MS = 10_000;
const HEADERS = {
  "Content-Type": "application/x-www-form-urlencoded",
  Referer: "https://music.163.com/",
  Origin: "https://music.163.com",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  // Server từ chối (code 50000005) nếu thiếu vài cookie tối thiểu này, dù không cần đăng nhập.
  Cookie: "NMTID=1; os=pc; appver=8.9.70",
};
// Chỉ tra lời cho vài kết quả đầu (khớp tên nhất theo NetEase xếp hạng) để không tốn quá nhiều request cho 1 truy vấn:
// search không trả kèm lời, phải gọi thêm 1 request/bài.
const MAX_LYRIC_LOOKUPS = 3;

interface NeteaseSong {
  id: number;
  name: string;
  artists: string;
  durationSec: number;
}

export interface NeteaseSearch {
  search(query: string): Promise<LrclibItem[]>;
}

/** Client API tìm kiếm không chính thức của NetEase Cloud Music, dùng làm nguồn lời dự phòng thứ hai sau LRCLIB. */
export class NeteaseProvider implements NeteaseSearch {
  constructor(private readonly fetchFn: typeof fetch = fetch) {}

  async search(query: string): Promise<LrclibItem[]> {
    const songs = await this.searchSongs(query);
    const items = await Promise.all(songs.slice(0, MAX_LYRIC_LOOKUPS).map((s) => this.fetchLyric(s)));
    return items.filter((i): i is LrclibItem => i !== null);
  }

  private async post(url: string, params: Record<string, unknown>): Promise<unknown> {
    const { params: encParams, encSecKey } = weapiEncrypt({ ...params, csrf_token: "" });
    const res = await this.fetchFn(`${url}?csrf_token=`, {
      method: "POST",
      headers: HEADERS,
      body: new URLSearchParams({ params: encParams, encSecKey }).toString(),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`NetEase lỗi HTTP ${res.status}`);
    return res.json();
  }

  private async searchSongs(query: string): Promise<NeteaseSong[]> {
    const data = (await this.post(SEARCH_URL, { s: query, type: 1, offset: 0, limit: MAX_LYRIC_LOOKUPS })) as {
      code?: number;
      result?: { songs?: { id: number; name: string; artists?: { name?: string }[]; duration: number }[] };
    };
    if (data.code !== 200) throw new Error(`NetEase tìm bài trả code ${data.code}`);
    const songs = data.result?.songs;
    if (!Array.isArray(songs)) return [];
    return songs.map((s) => ({
      id: Number(s.id),
      name: String(s.name ?? ""),
      artists: (s.artists ?? []).map((a) => a.name ?? "").join("/"),
      durationSec: Number(s.duration ?? 0) / 1000,
    }));
  }

  /** Lỗi mạng hoặc bài không có lời (chỉ nhạc không lời, lyric riêng tư…) trả null thay vì ném lỗi, để không chặn các bài còn lại. */
  private async fetchLyric(song: NeteaseSong): Promise<LrclibItem | null> {
    try {
      const data = (await this.post(LYRIC_URL, { id: song.id, lv: -1, kv: -1, tv: -1 })) as { lrc?: { lyric?: string } };
      const lyric = data.lrc?.lyric;
      if (typeof lyric !== "string" || !/\[\d/.test(lyric)) return null; // không có mốc thời gian thì không dùng được
      return { id: song.id, trackName: song.name, artistName: song.artists, duration: song.durationSec, instrumental: false, syncedLyrics: lyric };
    } catch {
      return null;
    }
  }
}
