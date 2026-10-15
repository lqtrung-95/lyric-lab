import "server-only";
import { AssessmentError, normalizeAssessment, type AssessmentResult } from "./assessment-normalize";

export class AssessmentUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssessmentUnavailableError";
  }
}

/**
 * Chấm phát âm một câu tiếng Trung bằng Azure Pronunciation Assessment (REST, WAV 16 kHz mono). `referenceText` là câu người học định đọc;
 * Azure so giọng với câu này và trả điểm từng âm tiết. Âm thanh chỉ chuyển tiếp, không lưu. Lỗi mạng/quota ném `AssessmentUnavailableError`.
 */
export async function assessWithAzure(wav: Uint8Array, referenceText: string, key: string, region: string, fetchFn: typeof fetch = fetch): Promise<AssessmentResult> {
  const config = { ReferenceText: referenceText, GradingSystem: "HundredMark", Granularity: "Phoneme", Dimension: "Comprehensive", EnableMiscue: "True" };
  let res: Response;
  try {
    res = await fetchFn(`https://${region}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=zh-CN&format=detailed`, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
        "Pronunciation-Assessment": Buffer.from(JSON.stringify(config)).toString("base64"),
        Accept: "application/json",
      },
      body: Buffer.from(wav),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new AssessmentUnavailableError("Không kết nối được Azure Speech");
  }
  if (!res.ok) throw new AssessmentUnavailableError(`Azure Speech trả ${res.status}`);
  try {
    return normalizeAssessment(await res.json());
  } catch (error) {
    if (error instanceof AssessmentError) throw error;
    throw new AssessmentError("bad_response");
  }
}
