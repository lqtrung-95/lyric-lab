import "server-only";
import { buildSsml } from "./build-ssml";

export class TtsUnavailableError extends Error {
  /** Mã HTTP Azure trả về (429 = quá tốc độ/hết hạn mức); không có nếu lỗi mạng. */
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "TtsUnavailableError";
    this.status = status;
  }
}

export interface AzureEndpoint { key: string; region: string }

/**
 * Tổng hợp với danh sách tài khoản Azure theo thứ tự ưu tiên: tài khoản đầu hết hạn mức (429), lỗi máy chủ hoặc mạng thì thử tài khoản kế tiếp.
 * Dùng để có khóa dự phòng (`AZURE_SPEECH_KEY_2`/`AZURE_SPEECH_REGION_2`); lỗi cuối cùng được ném lại nếu tất cả đều hỏng.
 */
export async function synthesizeWithFailover(text: string, endpoints: readonly AzureEndpoint[], fetchFn: typeof fetch = fetch): Promise<Buffer> {
  let last: unknown = new TtsUnavailableError("Chưa cấu hình Azure Speech");
  for (const e of endpoints) {
    try {
      return await synthesizeWithAzure(text, e.key, e.region, fetchFn);
    } catch (error) {
      last = error;
      if (!(error instanceof TtsUnavailableError)) throw error;
    }
  }
  throw last;
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
        "User-Agent": "songhanzi",
      },
      body: buildSsml(text),
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new TtsUnavailableError("Không kết nối được Azure Speech");
  }
  if (!res.ok) throw new TtsUnavailableError(`Azure Speech trả ${res.status}`, res.status);
  return Buffer.from(await res.arrayBuffer());
}
