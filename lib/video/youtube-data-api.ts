import { parseIsoDuration } from "@/lib/youtube/parse-iso-duration";

// Gọi YouTube Data API v3 để liệt kê video của một kênh và đọc thông tin (tên, kênh, thời lượng, nhúng được không). Không dùng "server-only"
// vì script nạp video (chạy bằng tsx) cũng dùng; khóa API do nơi gọi truyền vào.
const BASE = "https://www.googleapis.com/youtube/v3";

export interface ChannelInfo {
  id: string;
  title: string;
  uploadsPlaylistId: string;
}

export interface VideoMeta {
  videoId: string;
  title: string;
  channelTitle: string;
  channelId: string;
  durationSec: number;
  embeddable: boolean;
}

async function call(path: string, params: Record<string, string>, key: string) {
  const url = new URL(`${BASE}/${path}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const json = await res.json();
  if (!res.ok) throw new Error(`YouTube Data API ${path} ${res.status}: ${json.error?.message}`);
  return json;
}

export async function resolveChannelByHandle(handle: string, key: string): Promise<ChannelInfo | null> {
  const c = (await call("channels", { part: "contentDetails,snippet", forHandle: handle }, key)).items?.[0];
  return c ? { id: c.id, title: c.snippet.title, uploadsPlaylistId: c.contentDetails.relatedPlaylists.uploads } : null;
}

/** Mã các video đã đăng của kênh, mới nhất trước, tối đa `limit`. */
export async function listUploadVideoIds(playlistId: string, key: string, limit: number): Promise<string[]> {
  const ids: string[] = [];
  let token: string | undefined;
  do {
    const page = await call("playlistItems", { part: "contentDetails", playlistId, maxResults: "50", ...(token ? { pageToken: token } : {}) }, key);
    ids.push(...page.items.map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId));
    token = page.nextPageToken;
  } while (token && ids.length < limit);
  return ids.slice(0, limit);
}

export async function fetchVideosMeta(ids: string[], key: string): Promise<Map<string, VideoMeta>> {
  const out = new Map<string, VideoMeta>();
  for (let i = 0; i < ids.length; i += 50) {
    const v = await call("videos", { part: "snippet,contentDetails,status", id: ids.slice(i, i + 50).join(",") }, key);
    for (const x of v.items) {
      out.set(x.id, {
        videoId: x.id, title: x.snippet.title, channelTitle: x.snippet.channelTitle, channelId: x.snippet.channelId,
        durationSec: parseIsoDuration(x.contentDetails.duration), embeddable: x.status.embeddable,
      });
    }
  }
  return out;
}
