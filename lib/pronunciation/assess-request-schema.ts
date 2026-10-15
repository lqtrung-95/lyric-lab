import { z } from "zod";
import { MAX_AUDIO_BASE64_CHARS } from "./feedback-schema";

export const MAX_ASSESS_CHARS = 40;
const HAN_ONLY = /[^\p{Script=Han}]/gu;

/** Giữ lại đúng chữ Hán của câu người học nhập (bỏ dấu câu, khoảng trắng, chữ Latin) để làm câu tham chiếu cho Azure. */
export const toReferenceText = (text: string) => text.replace(HAN_ONLY, "");

export const assessRequestSchema = z.object({
  text: z.string().max(200).transform(toReferenceText).pipe(z.string().min(1).max(MAX_ASSESS_CHARS)),
  audio: z.string().min(100).max(MAX_AUDIO_BASE64_CHARS).regex(/^[A-Za-z0-9+/]+=*$/, "audio phải là base64"),
});
export type AssessRequest = z.infer<typeof assessRequestSchema>;

/** Kiểm tra byte đầu là tệp WAV (RIFF/WAVE) trước khi chuyển cho Azure. */
export function looksLikeWav(bytes: Uint8Array): boolean {
  const tag = (o: number) => String.fromCharCode(...bytes.subarray(o, o + 4));
  return bytes.length > 44 && tag(0) === "RIFF" && tag(8) === "WAVE";
}
