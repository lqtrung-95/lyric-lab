// Gọi ElevenLabs bằng REST: tìm voice theo tên (không hard-code ID) rồi tạo giọng đọc MP3.
// Khóa API chỉ đọc từ biến môi trường ELEVENLABS_API_KEY, không ghi vào file. Tiếng Việt cần model eleven_flash_v2_5 hoặc eleven_turbo_v2_5.
const API = "https://api.elevenlabs.io/v1";
const headers = () => ({ "xi-api-key": process.env.ELEVENLABS_API_KEY, "Content-Type": "application/json" });

export async function elevenLabsVoiceId(name) {
  const res = await fetch(`${API}/voices`, { headers: headers() });
  if (!res.ok) throw new Error(`ElevenLabs /voices lỗi ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { voices } = await res.json();
  const v = voices.find((x) => x.name.toLowerCase().startsWith(name.toLowerCase()));
  if (!v) throw new Error(`Không thấy voice "${name}" trong tài khoản. Có: ${voices.map((x) => x.name).join(", ")}. Thêm voice vào "My Voices" trên elevenlabs.io rồi chạy lại.`);
  return v.voice_id;
}

export async function elevenLabsSpeak(voiceId, text, { model, stability, similarity }) {
  const res = await fetch(`${API}/text-to-speech/${voiceId}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ text, model_id: model, language_code: "vi", voice_settings: { stability, similarity_boost: similarity, style: 0.3, use_speaker_boost: true } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs TTS lỗi ${res.status}: ${(await res.text()).slice(0, 300)}`);
  return Buffer.from(await res.arrayBuffer());
}
