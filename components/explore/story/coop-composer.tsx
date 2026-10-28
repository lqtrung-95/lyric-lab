"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { RubyLine } from "@/components/ui/ruby-text";
import { MESSAGE_TEMPLATES, composeMessage, slotOptions } from "@/lib/explore/coop/coop-messages";
import { coopPinyin } from "@/lib/explore/coop/coop-pinyin";
import { COOP_PHRASES } from "@/lib/explore/coop/coop-state";
import type { VoiceClip } from "@/lib/speech/voice-clip";
import { useClipRecorder } from "./use-clip-recorder";
import type { Hints } from "./use-story-hints";

const sel = "min-h-11 min-w-0 flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-2 text-body-md";

/**
 * Soạn câu tiếng Trung nói với đồng đội: chọn mẫu câu, điền nơi chốn (các cảnh của vụ án) hoặc đồ vật rồi gửi; hoặc bấm một câu nói nhanh có sẵn.
 * Không có chữ gõ tự do. Pinyin và nghĩa tiếng Việt chỉ hiện khi bật gợi ý. "Gửi + đọc to" ghi vài giây giọng bạn đọc câu rồi gửi kèm, khuyến khích nói thật.
 */
export function CoopComposer({ places, hints, onSay, compact = false }: { places: readonly string[]; hints: Hints; onSay: (zh: string, clip?: VoiceClip) => void; compact?: boolean }) {
  const [tpl, setTpl] = useState(MESSAGE_TEMPLATES[0].id);
  const [value, setValue] = useState("");
  const template = MESSAGE_TEMPLATES.find((t) => t.id === tpl) ?? MESSAGE_TEMPLATES[0];
  const options = template.slot ? slotOptions(template.slot, places) : [];
  const chosen = options.find((o) => o.id === value)?.id ?? options[0]?.id;
  const composed = composeMessage(template.id, chosen);
  const voice = useClipRecorder((_, clip) => { if (composed) onSay(composed.zh, clip); });
  const recording = voice.recording === "compose";
  const hole = (s: string) => s.replace("{s}", "…");
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2">
        <label className="flex min-w-0 flex-col gap-1 text-label-md font-extrabold">Mẫu câu
          <select value={tpl} onChange={(e) => { setTpl(e.target.value); setValue(""); }} className={sel}>
            {MESSAGE_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{hole(t.zh)}{hints.vi ? ` (${hole(t.vi)})` : ""}</option>)}
          </select>
        </label>
        {template.slot && (
          <label className="flex min-w-0 flex-col gap-1 text-label-md font-extrabold">{template.slot === "p" ? "Nơi chốn" : "Đồ vật"}
            <select value={chosen} onChange={(e) => setValue(e.target.value)} className={sel}>
              {options.map((o) => <option key={o.id} value={o.id}>{o.zh}{hints.pinyin ? ` ${coopPinyin(o.zh) ?? ""}` : ""}{hints.vi ? ` (${o.vi})` : ""}</option>)}
            </select>
          </label>
        )}
      </div>
      <div className="flex items-center gap-3">
        <p lang="zh-Hans" className={`min-w-0 flex-1 text-body-lg font-bold ${hints.pinyin ? "leading-[2.2]" : ""}`}>{composed ? <RubyLine zh={composed.zh} pinyin={coopPinyin(composed.zh)} show={hints.pinyin} /> : "…"}</p>
        <button type="button" disabled={!composed || recording} onClick={() => composed && onSay(composed.zh)} className="min-h-11 rounded-full border-2 border-ink bg-primary px-5 text-label-md font-extrabold text-on-primary disabled:opacity-40">Gửi</button>
      </div>
      {hints.vi && composed && <p className="text-body-sm text-on-surface-variant">{composed.vi}</p>}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={!composed || (!!voice.recording && !recording)} onClick={() => (recording ? void voice.stop() : void voice.start("compose"))}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink px-4 text-label-md font-extrabold disabled:opacity-40 ${recording ? "bg-error text-on-error" : "bg-primary-container text-on-primary-container"}`}>
          <Icon name={recording ? "stop" : "mic"} size={18} filled />{recording ? "Đang ghi… bấm để gửi" : "Gửi + đọc to"}
        </button>
        {!compact && <span className="text-label-md text-on-surface-variant">Đọc to câu trên, đồng đội nghe được giọng bạn.</span>}
        {voice.error && <span role="alert" className="text-label-md font-bold text-error">{voice.error}</span>}
      </div>
      {!compact && <div role="group" aria-label="Câu nói nhanh" className="flex flex-wrap gap-1.5">
        {COOP_PHRASES.map((p) => (
          <button key={p.zh} type="button" onClick={() => onSay(p.zh)} title={p.vi} className="min-h-9 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold hover:bg-surface-container-low"><span lang="zh-Hans">{p.zh}</span>{hints.pinyin && <span className="block text-[0.7em] font-normal text-primary">{coopPinyin(p.zh)}</span>}</button>
        ))}
      </div>}
    </div>
  );
}
