import { assessLyricQuality } from "@/lib/captions/assess-lyric-quality";
import { cleanCaptionLines } from "@/lib/captions/clean-caption-lines";
import { pickBestChineseTrack } from "@/lib/captions/pick-best-chinese-track";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { isProbeAuthorized } from "@/lib/debug/probe-guard";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const errInfo = (e: unknown) => ({ type: (e as { type?: string })?.type ?? "unknown", message: String((e as Error)?.message ?? e).slice(0, 120) });

/**
 * Thăm dò từ IP của máy chủ đang chạy (vd. Vercel): lấy caption YouTube và gọi LRCLIB, chỉ trả SỐ LIỆU
 * (danh sách track, số dòng, tỉ lệ chữ Hán, lỗi, độ trễ), tuyệt đối không trả nội dung lời. Chỉ bật khi có
 * CAPTION_PROBE_SECRET và header `x-probe-secret` khớp; ngược lại trả 404 như không tồn tại.
 */
export async function GET(req: Request) {
  if (!isProbeAuthorized(process.env.CAPTION_PROBE_SECRET, req.headers.get("x-probe-secret"))) {
    return new Response("Not found", { status: 404 });
  }
  const videoId = new URL(req.url).searchParams.get("videoId") ?? "";
  if (!isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });

  const out: Record<string, unknown> = { videoId, region: process.env.VERCEL_REGION ?? null };

  const provider = new YoutubeInnertubeCaptionProvider();
  let t0 = Date.now();
  try {
    const tracks = await provider.listTracks(videoId);
    out.tracks = tracks.map((t) => `${t.lang}/${t.kind}`);
    out.listMs = Date.now() - t0;
    const best = pickBestChineseTrack(tracks);
    out.bestTrack = best ? `${best.lang}/${best.kind}` : null;
    if (best) {
      t0 = Date.now();
      try {
        const lines = cleanCaptionLines(await provider.fetchLines(videoId, best));
        const q = assessLyricQuality(lines);
        out.fetch = { ok: true, ms: Date.now() - t0, lineCount: q.lineCount, hanLineRatio: q.hanLineRatio, verdict: q.verdict };
      } catch (e) {
        out.fetch = { ok: false, ms: Date.now() - t0, ...errInfo(e) };
      }
    }
  } catch (e) {
    out.listError = errInfo(e);
    out.listMs = Date.now() - t0;
  }

  t0 = Date.now();
  try {
    const items = await new LrclibProvider().search("晴天 周杰伦");
    out.lrclib = { ok: true, ms: Date.now() - t0, results: items.length, withSynced: items.filter((i) => i.syncedLyrics).length };
  } catch (e) {
    out.lrclib = { ok: false, ms: Date.now() - t0, ...errInfo(e) };
  }
  return Response.json(out);
}
