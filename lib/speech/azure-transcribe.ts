import "server-only";

export class TranscribeUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TranscribeUnavailableError";
  }
}

interface AzureSimple { RecognitionStatus?: string; DisplayText?: string }

/**
 * Nhận diện lời nói tiếng Trung tự do (không câu mẫu) bằng Azure Speech REST (WAV 16 kHz mono). Trả chữ nghe được, rỗng khi không nghe thấy giọng.
 * Âm thanh chỉ chuyển tiếp, không lưu. Lỗi mạng/quota ném `TranscribeUnavailableError`.
 */
export async function transcribeWithAzure(wav: Uint8Array, key: string, region: string, fetchFn: typeof fetch = fetch): Promise<string> {
  let res: Response;
  try {
    res = await fetchFn(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=zh-CN&format=simple&profanity=masked`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": key, "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000", Accept: "application/json" },
      body: Buffer.from(wav),
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new TranscribeUnavailableError("Không kết nối được Azure Speech");
  }
  if (!res.ok) throw new TranscribeUnavailableError(`Azure Speech trả ${res.status}`);
  const json = (await res.json().catch(() => null)) as AzureSimple | null;
  if (!json || json.RecognitionStatus !== "Success") return "";
  return (json.DisplayText ?? "").trim();
}
