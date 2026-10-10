// Gọi Gemini API bằng khóa Google AI Studio (REST `generateContent`), chỉ dùng ở server. Cho phép nhiều khóa: xoay vòng đều các khóa; khóa nào bị
// giới hạn tốc độ/hạn mức (429), lỗi tạm (5xx, quá thời gian) hoặc bị từ chối (401/403) thì nghỉ một lúc và chuyển sang khóa kế tiếp. Hết khóa dùng được
// thì ném lỗi để bộ định tuyến thử model kế tiếp (Groq, DeepSeek...). Lưu ý: hạn mức của Google tính theo DỰ ÁN Google Cloud chứ không theo khóa, nên
// nhiều khóa cùng một dự án dùng chung một hạn mức, và hạn mức tính RIÊNG cho từng model (flash-lite hết không làm flash hết theo).
import type { ChatFn, ChatRequest } from "./groq-chat";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
// Tác vụ ngắn (giải nghĩa một từ/câu, dịch lại một dòng): bình thường trả trong 1-3 giây, không nên chờ lâu rồi mới rớt sang model khác.
const TIMEOUT_MS = 10_000;
/** Tổng thời gian tối đa cho việc thử các khóa của một lần gọi (không tính lần thử đang chạy dở). */
const ATTEMPT_WINDOW_MS = 12_000;
// Khóa nghỉ được bỏ qua không tính lượt thử, nên con số này là số khóa còn sống tối đa thử trong một lần gọi: đủ rộng để vượt qua vài khóa vừa cạn hạn mức
// khi có hàng chục khóa, đủ hẹp để không đập vào cả bầy khóa khi Google lỗi diện rộng.
const MAX_ATTEMPTS = 5;
const DEFAULT_MAX_OUTPUT_TOKENS = 1024;
// Âm thanh phải đứng TRƯỚC văn bản: đặt sau thì flash-lite hay trả lời như thể ghi âm im lặng (đo thực tế với cùng một file).
const RATE_LIMIT_COOLDOWN_MS = 60_000; // giới hạn theo phút
const DAILY_LIMIT_COOLDOWN_MS = 15 * 60_000; // giới hạn theo ngày: thử lại muộn hơn, đỡ đập vào khóa đã cạn
const TRANSIENT_COOLDOWN_MS = 5_000;
const REJECTED_KEY_COOLDOWN_MS = 60 * 60_000; // khóa sai/bị thu hồi

/** Tách chuỗi nhiều khóa (ngăn cách bằng dấu phẩy, chấm phẩy, khoảng trắng hoặc xuống dòng), bỏ khóa rỗng/trùng. */
export function parseGeminiKeys(raw: string | undefined): string[] {
  return [...new Set((raw ?? "").split(/[\s,;]+/).map((k) => k.trim()).filter((k) => k.length >= 20))];
}

export interface GeminiChatOptions {
  fetchFn?: typeof fetch;
  /** Đồng hồ (ms), để test điều khiển được thời gian nghỉ của khóa. */
  now?: () => number;
  /** Nguồn số ngẫu nhiên [0,1) chọn khóa bắt đầu (mặc định `Math.random`); test truyền hàm cố định. */
  random?: () => number;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[];
  promptFeedback?: { blockReason?: string };
}

const isPerDayLimit = (body: string) => /per\s*day|PerDay|daily/i.test(body);

/** Chỉ các dòng Gemini 2.5 Flash cho tắt "suy nghĩ" bằng ngân sách 0 (nhanh và rẻ); model khác không nhận trường này nên bỏ qua. */
const supportsThinkingOff = (model: string) => /^gemini-2\.5-flash/.test(model);

export function createGeminiChat(keys: string[], options: GeminiChatOptions = {}): ChatFn {
  const fetchFn = options.fetchFn ?? fetch;
  const now = options.now ?? Date.now;
  // Nghỉ theo từng cặp (model, khóa) vì hạn mức tính riêng cho từng model; khóa bị từ chối (401/403) hỏng với mọi model nên nghỉ theo khóa.
  const cooldownUntil = new Map<string, number>();
  const rejectedUntil = new Map<string, number>();
  // Mỗi tiến trình serverless có bộ đếm riêng: bắt đầu từ vị trí ngẫu nhiên để hàng chục tiến trình mới khởi động không cùng dồn vào khóa đầu tiên.
  let cursor = Math.floor((options.random ?? Math.random)() * Math.max(1, keys.length));

  return async (req: ChatRequest) => {
    if (keys.length === 0) throw new Error("Chưa cấu hình GEMINI_API_KEYS");
    const startedAt = now();
    const start = cursor++ % keys.length;
    let lastError = "Gemini: không có khóa nào dùng được";
    let attempts = 0;
    for (let i = 0; i < keys.length && attempts < MAX_ATTEMPTS && now() - startedAt <= ATTEMPT_WINDOW_MS; i++) {
      const key = keys[(start + i) % keys.length];
      const slot = `${req.model}|${key}`;
      if ((cooldownUntil.get(slot) ?? 0) > now() || (rejectedUntil.get(key) ?? 0) > now()) continue;
      attempts++;
      try {
        const res = await fetchFn(`${ENDPOINT}/${encodeURIComponent(req.model)}:generateContent`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: req.system }] },
            contents: [{ role: "user", parts: [...(req.audio ? [{ inlineData: { mimeType: req.audio.mimeType, data: req.audio.data } }] : []), { text: req.user }] }],
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: req.maxTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
              temperature: 0.3,
              ...(supportsThinkingOff(req.model) ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
            },
          }),
          signal: AbortSignal.timeout(req.timeoutMs ?? TIMEOUT_MS),
        });
        if (res.ok) {
          const body = (await res.json()) as GeminiResponse;
          const text = (body.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? "").join("").trim();
          if (text) return text;
          // Câu trả lời trống (bị chặn an toàn hoặc cắt): thử lại bằng khóa khác không giúp được, báo lỗi để chuyển model.
          throw new Error(`Gemini trả rỗng (${body.promptFeedback?.blockReason ?? body.candidates?.[0]?.finishReason ?? "không rõ lý do"})`);
        }
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        lastError = `Gemini ${res.status}`;
        if (res.status === 429) { cooldownUntil.set(slot, now() + (isPerDayLimit(detail) ? DAILY_LIMIT_COOLDOWN_MS : RATE_LIMIT_COOLDOWN_MS)); continue; }
        if (res.status === 401 || res.status === 403) { rejectedUntil.set(key, now() + REJECTED_KEY_COOLDOWN_MS); continue; }
        if (res.status >= 500) { cooldownUntil.set(slot, now() + TRANSIENT_COOLDOWN_MS); continue; }
        // Lỗi còn lại (400 sai yêu cầu, 404 sai tên model...) giống nhau với mọi khóa: dừng ngay.
        throw new Error(`Gemini ${res.status}: ${detail.slice(0, 120)}`);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        if (message.startsWith("Gemini")) throw e;
        // Lỗi mạng hoặc quá thời gian: coi như lỗi tạm của khóa này.
        lastError = `Gemini: ${message.slice(0, 80)}`;
        cooldownUntil.set(slot, now() + TRANSIENT_COOLDOWN_MS);
      }
    }
    throw new Error(`${lastError} (đã thử ${attempts} khóa)`);
  };
}
