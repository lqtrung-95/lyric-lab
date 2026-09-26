import "server-only";
import { buildSsml } from "./build-ssml";

export class TtsUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TtsUnavailableError";
  }
}

// Định dạng mp3 mono 24 kHz 48 kbps: nhỏ (vài KB cho một từ) mà vẫn rõ tiếng.
const OUTPUT_FORMAT = "audio-24khz-48kbitrate-mono-mp3";

/** Gọi Azure Speech REST để tổng hợp một từ/câu tiếng Trung thành mp3. Lỗi mạng hoặc hết hạn mức ném TtsUnavailableError. */
export async function synthesizeWithAzure(text: string, key: string, region: string, fetchFn: typeof fetch = fetch): Promise<Buffer> {
  let res: Response;
  try {
    res = await fetchFn(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": OUTPUT_FORMAT,
        "User-Agent": "lyric-lab",
      },
      body: buildSsml(text),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new TtsUnavailableError("Không kết nối được Azure Speech");
  }
  if (!res.ok) throw new TtsUnavailableError(`Azure Speech trả ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}
