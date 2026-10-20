"use client";

import { useSfxEnabled } from "@/components/feedback/use-sfx-enabled";
import { playSfx, writeSfxEnabled } from "@/lib/feedback/sfx";
import { SettingRow } from "./settings-card";

/** Công tắc âm thanh hiệu ứng (đúng/sai/qua chặng). Bật thì phát thử một tiếng để người dùng biết âm lượng. */
export function SfxRow() {
  const on = useSfxEnabled();
  function toggle(next: boolean) {
    writeSfxEnabled(next);
    if (next) playSfx("correct");
  }
  return (
    <SettingRow label="Âm thanh hiệu ứng" hint="Tiếng ngắn khi trả lời đúng, sai và khi qua chặng. Mặc định bật ở máy tính, tắt ở điện thoại. Không phát khi đang đọc mẫu tiếng Trung.">
      <button type="button" role="switch" aria-checked={on} aria-label="Âm thanh hiệu ứng" onClick={() => toggle(!on)}
        className={`relative inline-flex h-8 w-14 items-center rounded-full border-2 border-ink transition-colors ${on ? "bg-secondary" : "bg-surface-container-high"}`}>
        <span className={`inline-block size-5 rounded-full border-2 border-ink bg-surface-container-lowest transition-transform motion-reduce:transition-none ${on ? "translate-x-7" : "translate-x-1"}`} />
      </button>
    </SettingRow>
  );
}
