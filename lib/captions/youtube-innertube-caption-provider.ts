import { Innertube } from "youtubei.js";
import type { CaptionLine, CaptionProvider, CaptionTrackInfo } from "./caption-provider-types";
import { CaptionError } from "./caption-errors";
import { parseJson3CaptionEvents } from "./parse-json3-caption-events";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

// Client WEB thường trả UNPLAYABLE (cần PO token); ANDROID/IOS trả được track. Thử lần lượt.
const CLIENTS = ["ANDROID", "IOS"] as const;
const REQUEST_TIMEOUT_MS = 10_000;

function assertVideoId(videoId: string) {
  if (!isValidVideoId(videoId)) throw new CaptionError("parse", "videoId không hợp lệ");
}

function withTimeout<T>(p: Promise<T>): Promise<T> {
  return Promise.race([
    p,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new CaptionError("network", "Quá thời gian chờ")), REQUEST_TIMEOUT_MS),
    ),
  ]);
}

/**
 * Lấy caption qua InnerTube (endpoint không chính thức, có thể bị YouTube đổi hoặc chặn).
 * Giữ sau interface CaptionProvider để thay nguồn dễ dàng.
 */
export class YoutubeInnertubeCaptionProvider implements CaptionProvider {
  private client: Promise<Innertube> | null = null;

  private getClient() {
    this.client ??= Innertube.create({ retrieve_player: false });
    return this.client;
  }

  async listTracks(videoId: string): Promise<CaptionTrackInfo[]> {
    assertVideoId(videoId);
    const yt = await this.getClient();
    let lastError: unknown;

    for (const client of CLIENTS) {
      try {
        const info = await withTimeout(yt.getBasicInfo(videoId, { client }));
        const status = info.playability_status?.status;
        if (status && status !== "OK") {
          lastError = new CaptionError(
            status === "LOGIN_REQUIRED" ? "blocked" : "no_caption",
            `Video không phát được (${status}): ${info.playability_status?.reason ?? ""}`,
          );
          continue;
        }
        return (info.captions?.caption_tracks ?? []).map((t) => ({
          lang: t.language_code,
          kind: t.kind === "asr" ? "asr" : "manual",
          name: t.name?.text,
          ref: t.base_url,
        }));
      } catch (cause) {
        lastError = cause;
      }
    }
    if (lastError instanceof CaptionError) throw lastError;
    throw new CaptionError("network", "Không lấy được danh sách track", { cause: lastError });
  }

  async fetchLines(videoId: string, track: CaptionTrackInfo): Promise<CaptionLine[]> {
    assertVideoId(videoId);
    if (!track.ref) throw new CaptionError("parse", "Track thiếu URL tải");
    const url = new URL(track.ref);
    if (!url.hostname.endsWith(".youtube.com")) {
      throw new CaptionError("parse", "URL caption không thuộc youtube.com");
    }
    url.searchParams.set("fmt", "json3");
    url.searchParams.delete("tlang"); // không nhận bản dịch tự động

    let res: Response;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (cause) {
      throw new CaptionError("network", "Tải caption thất bại", { cause });
    }
    if (res.status === 403 || res.status === 429) {
      throw new CaptionError("blocked", `YouTube từ chối tải caption (${res.status})`);
    }
    if (!res.ok) throw new CaptionError("network", `Tải caption lỗi HTTP ${res.status}`);
    const body = await res.text();
    if (!body) throw new CaptionError("blocked", "Phản hồi caption rỗng (nghi bị chặn)");
    return parseJson3CaptionEvents(body);
  }
}
