"use client";

import { useState, useSyncExternalStore } from "react";
import { VOICE_KEY, listChineseVoices, pickChineseVoice, readPreferredVoice, speakChinese, speechSupported } from "@/lib/speech/speak-chinese";

const noop = () => () => {};

// Danh sách giọng của trình duyệt nạp trễ và có thể đổi (sự kiện voiceschanged): theo dõi để cập nhật danh sách.
function subscribeVoices(onChange: () => void) {
  if (!speechSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}
const voiceNames = () => (speechSupported() ? listChineseVoices(window.speechSynthesis.getVoices()).map((v) => v.name).join("\n") : "");

/** Chọn giọng đọc tiếng Trung cho nút loa (giọng có sẵn của thiết bị; bản Natural/Premium nghe tự nhiên hơn). */
export function VoiceSection() {
  const supported = useSyncExternalStore(noop, speechSupported, () => false);
  const names = useSyncExternalStore(subscribeVoices, voiceNames, () => "").split("\n").filter(Boolean);
  const [chosen, setChosen] = useState<string | null>(() => readPreferredVoice());
  const active = names.length ? pickChineseVoice(names.map((name) => ({ name, lang: "zh-CN" })), chosen)?.name : undefined;

  if (!supported) return null;

  function choose(name: string) {
    setChosen(name);
    try {
      localStorage.setItem(VOICE_KEY, name);
    } catch {
      // Không lưu được: giọng chỉ đổi trong phiên này.
    }
    speakChinese("你好，我们一起学中文吧");
  }

  return (
    <section aria-labelledby="voice-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="voice-heading" className="font-serif text-headline-md text-on-surface">Giọng đọc</h2>
      {names.length === 0 ? (
        <p className="mt-2 text-body-md text-on-surface-variant">Thiết bị này chưa có giọng tiếng Trung. Hãy thêm giọng trong cài đặt hệ điều hành (ví dụ macOS: Cài đặt → Trợ năng → Nội dung được đọc → Giọng nói hệ thống → Tiếng Trung).</p>
      ) : (
        <>
          <label className="mt-space-sm inline-flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Giọng tiếng Trung</span>
            <select value={active} onChange={(e) => choose(e.target.value)} className="min-h-11 max-w-[16rem] rounded-full bg-surface-container-high px-3 text-label-md font-semibold text-secondary">
              {names.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <p className="mt-1 text-label-md text-on-surface-variant">Chọn giọng có chữ “Natural”, “Premium” hoặc “Enhanced” nếu có: nghe tự nhiên hơn. Đổi giọng sẽ đọc thử một câu.</p>
        </>
      )}
    </section>
  );
}
