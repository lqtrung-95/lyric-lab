import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const ZH = /^(zh|yue)/i;

/**
 * Đối chiếu độc lập bằng yt-dlp: video có track tiếng Trung không (chỉ đọc metadata, không tải media).
 * `autoZh` gồm cả track tự động và track dịch tự động nên chỉ để tham khảo.
 */
export async function ytDlpOracle(videoId: string): Promise<{ manualZh: boolean; autoZh: boolean } | null> {
  const bin = process.env.YTDLP_BIN ?? "yt-dlp";
  try {
    const { stdout } = await run(
      bin,
      ["--dump-json", "--skip-download", "--no-warnings", `https://www.youtube.com/watch?v=${videoId}`],
      { timeout: 60_000, maxBuffer: 64 * 1024 * 1024 },
    );
    const info = JSON.parse(stdout);
    const has = (o?: Record<string, unknown>) => Object.keys(o ?? {}).some((k) => ZH.test(k));
    return { manualZh: has(info.subtitles), autoZh: has(info.automatic_captions) };
  } catch {
    return null;
  }
}
