import { assessLyricQuality } from "@/lib/captions/assess-lyric-quality";
import type { CaptionProvider } from "@/lib/captions/caption-provider-types";
import { cleanCaptionLines } from "@/lib/captions/clean-caption-lines";
import { pickBestChineseTrack } from "@/lib/captions/pick-best-chinese-track";
import { buildLrclibQueries } from "./build-lrclib-queries";
import type { LrclibSearch } from "./lrclib-provider";
import { NoLyricsError, type LrclibItem, type LyricsAttempt, type LyricsResult, type VideoMeta } from "./lyrics-types";
import { parseLrc } from "./parse-lrc";
import { pickLrclibVersion } from "./pick-lrclib-version";

// Caption phải phủ tối thiểu tỉ lệ này thời lượng video mới coi là lời đầy đủ.
const MIN_CAPTION_COVERAGE = 0.5;
const errMsg = (e: unknown) => (e instanceof Error ? e.message : String(e));

export interface LyricsDeps {
  captions: CaptionProvider;
  lrclib: LrclibSearch;
}

/** Lấy lời cho video: caption YouTube (chính chủ) trước, không được thì LRCLIB. Không bao giờ để LLM sinh lời. */
export async function getLyricsForVideo(video: VideoMeta, deps: LyricsDeps): Promise<LyricsResult> {
  const attempts: LyricsAttempt[] = [];

  const fromCaption = await tryCaption(video, deps.captions, attempts);
  if (fromCaption) return { ...fromCaption, source: "youtube_caption", attempts };

  const fromLrclib = await tryLrclib(video, deps.lrclib, attempts);
  if (fromLrclib) return { ...fromLrclib, source: "lrclib", attempts };

  throw new NoLyricsError(attempts);
}

async function tryCaption(video: VideoMeta, captions: CaptionProvider, attempts: LyricsAttempt[]) {
  const source = "youtube_caption" as const;
  try {
    const track = pickBestChineseTrack(await captions.listTracks(video.videoId));
    if (!track) {
      attempts.push({ source, outcome: "no_data" });
      return null;
    }
    const lines = cleanCaptionLines(await captions.fetchLines(video.videoId, track));
    const quality = assessLyricQuality(lines);
    const coverage = video.durationSec > 0 ? quality.coverageSec / video.durationSec : 1;
    if (quality.verdict !== "ok" || coverage < MIN_CAPTION_COVERAGE) {
      attempts.push({ source, outcome: "low_quality", detail: `han=${quality.hanLineRatio.toFixed(2)} coverage=${coverage.toFixed(2)}` });
      return null;
    }
    attempts.push({ source, outcome: "used", detail: `${track.lang}/${track.kind}` });
    return { lines, script: quality.script };
  } catch (e) {
    attempts.push({ source, outcome: "error", detail: errMsg(e) });
    return null;
  }
}

async function tryLrclib(video: VideoMeta, lrclib: LrclibSearch, attempts: LyricsAttempt[]) {
  const source = "lrclib" as const;
  const items = new Map<number, LrclibItem>();
  let failures = 0;
  const queries = buildLrclibQueries(video.title);
  for (const q of queries) {
    try {
      (await lrclib.search(q)).forEach((i) => items.set(i.id, i));
    } catch (e) {
      failures++;
      attempts.push({ source, outcome: "error", detail: errMsg(e) });
    }
  }
  if (items.size === 0) {
    if (failures < queries.length || queries.length === 0) attempts.push({ source, outcome: "no_data" });
    return null;
  }

  const picked = pickLrclibVersion([...items.values()], video);
  if (!picked) {
    attempts.push({ source, outcome: "no_match", detail: `${items.size} kết quả, không bản nào khớp tên và độ dài` });
    return null;
  }
  const lines = parseLrc(picked.item.syncedLyrics!);
  const quality = assessLyricQuality(lines);
  if (quality.verdict !== "ok") {
    attempts.push({ source, outcome: "low_quality", detail: `han=${quality.hanLineRatio.toFixed(2)}` });
    return null;
  }
  attempts.push({ source, outcome: "used", detail: `id=${picked.item.id} gap=${picked.gapSec.toFixed(1)}s` });
  return { lines, script: quality.script };
}
