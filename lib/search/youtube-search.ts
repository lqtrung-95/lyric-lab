import "server-only";
import { Innertube } from "youtubei.js";
import { getServerEnv } from "@/lib/env/server-env";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";
import { parseIsoDuration } from "@/lib/youtube/parse-iso-duration";
import { rankSearchResults } from "./rank-search-results";
import type { SearchSong } from "./search-types";

const TIMEOUT_MS = 8_000;

export class SearchUnavailableError extends Error {}

const withTimeout = <T>(p: Promise<T>) =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error("search timeout")), TIMEOUT_MS))]);

let client: Promise<Innertube> | null = null;

/** Tìm qua InnerTube (không tốn hạn mức Data API, nhưng không chính thức nên có thể hỏng khi YouTube đổi). */
async function searchInnertube(q: string): Promise<SearchSong[]> {
  client ??= Innertube.create({ retrieve_player: false });
  const yt = await client;
  const res = await withTimeout(yt.search(q, { type: "video" }));
  const out: SearchSong[] = [];
  for (const n of res.results ?? []) {
    const v = n as unknown as { type?: string; video_id?: string; title?: { text?: string }; author?: { name?: string }; duration?: { seconds?: number } };
    if (v.type !== "Video" || !v.video_id || !isValidVideoId(v.video_id) || !v.title?.text) continue;
    out.push({ videoId: v.video_id, title: v.title.text, channelTitle: v.author?.name ?? "", durationSec: v.duration?.seconds });
  }
  if (out.length === 0) throw new Error("innertube returned no videos");
  return out;
}

interface ApiItem {
  id?: string | { videoId?: string };
  snippet?: { title?: string; channelTitle?: string };
  contentDetails?: { duration?: string };
  status?: { embeddable?: boolean };
}

async function dataApi(path: string, params: Record<string, string>): Promise<{ items?: ApiItem[] }> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries({ ...params, key: getServerEnv().YOUTUBE_DATA_API_KEY })) url.searchParams.set(k, v);
  const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new SearchUnavailableError(`YouTube Data API HTTP ${res.status}`); // gồm 403 quotaExceeded
  return res.json();
}

/** Dự phòng chính thức: search.list tốn 100 đơn vị hạn mức/lần nên chỉ dùng khi InnerTube lỗi. */
async function searchDataApi(q: string): Promise<SearchSong[]> {
  const data = await dataApi("search", { part: "snippet", type: "video", videoEmbeddable: "true", videoCategoryId: "10", maxResults: "12", q });
  return (data.items ?? []).flatMap((i) => {
    const videoId = typeof i.id === "object" ? i.id?.videoId : undefined;
    return videoId && isValidVideoId(videoId) ? [{ videoId, title: i.snippet?.title ?? "", channelTitle: i.snippet?.channelTitle ?? "" }] : [];
  });
}

/** Bổ sung thời lượng và cờ nhúng được qua videos.list (1 đơn vị cho tối đa 50 video). Lỗi thì trả nguyên kết quả. */
async function enrich(songs: SearchSong[]): Promise<{ songs: SearchSong[]; embeddable?: Set<string> }> {
  try {
    const data = await dataApi("videos", { part: "contentDetails,status", id: songs.map((s) => s.videoId).join(",") });
    const info = new Map((data.items ?? []).map((i) => [typeof i.id === "string" ? i.id : "", i]));
    const embeddable = new Set<string>();
    const withDuration = songs.map((s) => {
      const it = info.get(s.videoId);
      if (it?.status?.embeddable !== false) embeddable.add(s.videoId);
      return it?.contentDetails?.duration ? { ...s, durationSec: parseIsoDuration(it.contentDetails.duration) } : s;
    });
    return { songs: withDuration, embeddable };
  } catch {
    return { songs };
  }
}

/**
 * Tìm bài hát trên YouTube: InnerTube trước, lỗi thì chuyển sang YouTube Data API chính thức.
 * Cả hai cùng thất bại (vd. hết hạn mức) thì ném SearchUnavailableError để giao diện báo "chưa tìm được, hãy dán link".
 */
export async function searchYoutubeSongs(q: string): Promise<SearchSong[]> {
  let raw: SearchSong[];
  try {
    raw = await searchInnertube(q);
  } catch {
    try {
      raw = await searchDataApi(q);
    } catch {
      throw new SearchUnavailableError("cả InnerTube và Data API đều lỗi");
    }
  }
  const { songs, embeddable } = await enrich(raw);
  return rankSearchResults(songs, embeddable);
}
