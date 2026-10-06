"use client";

import { useState, useSyncExternalStore } from "react";
import { SelectField } from "@/components/ui/select-field";
import { SettingRow } from "./settings-card";
import { playChinese } from "@/lib/speech/play-chinese";
import { CLOUD_VOICE, VOICE_KEY, listChineseVoices, readPreferredVoice, speechSupported } from "@/lib/speech/speak-chinese";

// Danh sách giọng của trình duyệt nạp trễ và có thể đổi (sự kiện voiceschanged): theo dõi để cập nhật danh sách.
function subscribeVoices(onChange: () => void) {
  if (!speechSupported()) return () => {};
  window.speechSynthesis.addEventListener("voiceschanged", onChange);
  return () => window.speechSynthesis.removeEventListener("voiceschanged", onChange);
}
const voiceNames = () => (speechSupported() ? listChineseVoices(window.speechSynthesis.getVoices()).map((v) => v.name).join("\n") : "");

/** Dòng chọn giọng đọc cho nút loa: giọng AI tự nhiên (mặc định) hoặc một giọng có sẵn của thiết bị. */
export function VoiceRows() {
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
    <SettingRow label="Giọng đọc tiếng Trung" hint="Giọng AI cần kết nối mạng; không dùng được thì nút loa đọc bằng giọng thiết bị. Đổi giọng sẽ đọc thử một câu.">
      <SelectField aria-label="Giọng đọc tiếng Trung" value={chosen} onChange={(e) => choose(e.target.value)} className="max-w-[19rem] truncate">
        <option value={CLOUD_VOICE}>Giọng AI tự nhiên (khuyên dùng)</option>
        {names.map((n) => <option key={n} value={n}>{n} (thiết bị)</option>)}
      </SelectField>
    </SettingRow>
  );
}
