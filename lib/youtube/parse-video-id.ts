// Chuẩn hóa mọi dạng link YouTube về videoId 11 ký tự (IN-01). Thuần, dùng được ở client.
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);
const PATH_PREFIXES = ["shorts", "embed", "live", "v"];

export function isValidVideoId(value: string): boolean {
  return VIDEO_ID.test(value);
}

export function parseVideoId(input: string): string | null {
  const raw = input.trim();
  if (isValidVideoId(raw)) return raw;

  let url: URL;
  try {
    url = new URL(/^[a-z]+:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);

  let candidate: string | null | undefined = null;
  if (host === "youtu.be") {
    candidate = segments[0];
  } else if (YOUTUBE_HOSTS.has(host)) {
    if (url.pathname === "/watch") candidate = url.searchParams.get("v");
    else if (PATH_PREFIXES.includes(segments[0])) candidate = segments[1];
  }
  return candidate && isValidVideoId(candidate) ? candidate : null;
}
