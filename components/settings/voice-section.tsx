"use client";

import { useState, useSyncExternalStore } from "react";
import { playChinese } from "@/lib/speech/play-chinese";
import { CLOUD_VOICE, VOICE_KEY, listChineseVoices, readPreferredVoice, speechSupported } from "@/lib/speech/speak-chinese";

// Danh sách giọng của trình duyệt nạp trễ và có thể đổi (sự kiện voiceschanged): theo dõi để cập nhật danh sách.
function subscribeVoices(onChange: () => void) {
  if (!speechSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}
const voiceNames = () => (speechSupported() ? listChineseVoices(window.speechSynthesis.getVoices()).map((v) => v.name).join("\n") : "");

/** Chọn giọng đọc cho nút loa: giọng AI tự nhiên (mặc định) hoặc một giọng có sẵn của thiết bị. */
export function VoiceSection() {
  const names = useSyncExternalStore(subscribeVoices, voiceNames, () => "").split("\n").filter(Boolean);
  const [chosen, setChosen] = useState<string>(() => readPreferredVoice() ?? CLOUD_VOICE);

  function choose(value: string) {
    setChosen(value);
    try {
      localStorage.setItem(VOICE_KEY, value);
    } catch {
      // Không lưu được: giọng chỉ đổi trong phiên này.
    }
    void playChinese("你好，我们一起学中文吧");
  }

  return (
    <section aria-labelledby="voice-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="voice-heading" className="font-serif text-headline-md text-on-surface">Giọng đọc</h2>
      <label className="mt-space-sm inline-flex items-center gap-2 text-label-md text-on-surface-variant">
        <span>Giọng tiếng Trung</span>
        <select value={chosen} onChange={(e) => choose(e.target.value)} className="min-h-11 max-w-[18rem] rounded-full bg-surface-container-high px-3 text-label-md font-semibold text-secondary">
          <option value={CLOUD_VOICE}>Giọng AI tự nhiên (khuyên dùng)</option>
          {names.map((n) => <option key={n} value={n}>{n} (thiết bị)</option>)}
        </select>
      </label>
      <p className="mt-1 text-label-md text-on-surface-variant">Giọng AI cần kết nối mạng; khi không dùng được, nút loa tự đọc bằng giọng của thiết bị. Đổi giọng sẽ đọc thử một câu.</p>
    </section>
  );
}
