export const TTS_VOICE = "zh-CN-XiaoxiaoNeural";
// Nói chậm hơn bình thường một chút cho người mới học nghe rõ thanh điệu.
export const TTS_RATE = "-10%";

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

/** SSML gửi Azure Speech cho một từ/câu tiếng Trung. Văn bản luôn được escape nên không thể chèn thẻ SSML. */
export function buildSsml(text: string, voice = TTS_VOICE, rate = TTS_RATE): string {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN"><voice name="${voice}"><prosody rate="${rate}">${escapeXml(text)}</prosody></voice></speak>`;
}
