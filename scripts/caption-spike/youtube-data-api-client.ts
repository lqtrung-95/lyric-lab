// Data API v3 chỉ dùng để tìm video và lấy thời lượng (search.list 100 đơn vị, videos.list 1 đơn vị).
export interface SearchHit {
  videoId: string;
  title: string;
  channel: string;
}

const BASE = "https://www.googleapis.com/youtube/v3";

const decodeEntities = (s: string) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

async function call(path: string, params: Record<string, string>, key: string) {
  const url = new URL(`${BASE}/${path}`);
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  const json = await res.json();
  if (!res.ok) throw new Error(`Data API ${path} ${res.status}: ${json.error?.errors?.[0]?.reason ?? json.error?.message}`);
  return json;
}

export async function searchVideos(query: string, key: string, maxResults = 3): Promise<SearchHit[]> {
  const json = await call("search", { part: "snippet", type: "video", maxResults: String(maxResults), q: query }, key);
  return json.items.map((i: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }) => ({
    videoId: i.id.videoId,
    title: decodeEntities(i.snippet.title),
    channel: decodeEntities(i.snippet.channelTitle),
  }));
}

/** Thời lượng (giây) theo videoId, gọi theo lô 50. */
export async function getDurations(ids: string[], key: string): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (let i = 0; i < ids.length; i += 50) {
    const json = await call("videos", { part: "contentDetails", id: ids.slice(i, i + 50).join(",") }, key);
    for (const v of json.items) out[v.id] = parseIsoDuration(v.contentDetails.duration);
  }
  return out;
}

export function parseIsoDuration(iso: string): number {
  const m = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!m) return 0;
  return Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
}
