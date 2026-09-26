"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { yeCheAnalysis } from "@/lib/preview/fixtures/ye-che-analysis";

const LINE_MS = 2600;
const REDUCED = "(prefers-reduced-motion: reduce)";
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const items = new Map(yeCheAnalysis.items.map((i) => [i.id, i]));

/**
 * Demo tương tác của bài hư cấu "夜车": lời tự chạy như khi nghe thật, bấm vào từ được tô sáng để xem thẻ từ.
 * Chỉ là minh họa (không phát nhạc, không gọi mạng). Người chọn giảm chuyển động thì demo bắt đầu ở trạng thái tạm dừng.
 */
export function LiveDemo() {
  const lines = yeCheAnalysis.lines;
  const [current, setCurrent] = useState(1);
  // null = người dùng chưa bấm: tự chạy trừ khi họ chọn giảm chuyển động.
  const reduced = useSyncExternalStore(subscribeMotion, () => window.matchMedia(REDUCED).matches, () => true);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const playing = userPlaying ?? !reduced;
  const [selected, setSelected] = useState("vocab:离开");
  const card = useMemo(() => items.get(selected), [selected]);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setCurrent((c) => (c + 1) % lines.length), LINE_MS);
    return () => clearInterval(t);
  }, [playing, lines.length]);

  return (
    <section aria-labelledby="demo-heading" className="mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Xem thử ngay</p>
      <h2 id="demo-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Bấm vào một từ được tô sáng</h2>
      <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">Đây là bài hát mẫu do chúng tôi tự viết. Với bài thật, lời chạy theo nhạc trên video YouTube.</p>

      <div className="mt-space-lg grid gap-space-md lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl bg-inverse-surface p-space-md text-inverse-on-surface shadow-[0_24px_60px_-28px_rgba(20,10,5,0.6)]">
          <div className="mb-space-sm flex items-center justify-between">
            <p className="inline-flex items-center gap-2 text-label-sm uppercase tracking-wider opacity-80"><Icon name="graphic_eq" size={16} />夜车 · bài mẫu</p>
            <button type="button" onClick={() => setUserPlaying(!playing)} aria-label={playing ? "Tạm dừng demo" : "Chạy demo"}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-inverse-on-surface/15 hover:bg-inverse-on-surface/25">
              <Icon name={playing ? "pause" : "play_arrow"} size={22} filled />
            </button>
          </div>
          <ol className="space-y-3">
            {lines.map((line, i) => (
              <li key={line.index} aria-current={i === current ? "true" : undefined} className={`rounded-xl px-3 py-2 transition-all ${i === current ? "bg-inverse-on-surface/10" : "opacity-70"}`}>
                <p className="text-label-sm">{line.pinyin}</p>
                <p lang="zh" className={`font-serif ${i === current ? "text-[26px]" : "text-[20px]"}`}>
                  {line.tokens.map((t, k) => {
                    const item = t.itemId ? items.get(t.itemId) : undefined;
                    return item ? (
                      <button key={k} type="button" onClick={() => setSelected(item.id)} aria-label={`Xem thẻ từ ${t.text}`} aria-pressed={selected === item.id}
                        className={`inline-flex min-h-11 items-center rounded-md px-1 underline decoration-2 underline-offset-4 ${selected === item.id ? "bg-primary-container text-on-primary-container" : "decoration-primary-fixed-dim hover:bg-inverse-on-surface/15"}`}>{t.text}</button>
                    ) : <span key={k}>{t.text}</span>;
                  })}
                </p>
                {i === current && line.translation && <p className="mt-1 text-label-md opacity-85">{line.translation}</p>}
              </li>
            ))}
          </ol>
        </div>

        {card && (
          <article aria-live="polite" className="rounded-3xl bg-surface-container-lowest p-space-md shadow-[0_1px_10px_rgba(30,26,22,0.08)]">
            <div className="flex items-start justify-between">
              <div>
                <h3 lang="zh" className="font-serif text-[52px] font-medium leading-none text-on-surface">{card.term}</h3>
                <p className="mt-2 flex items-center gap-2 text-pinyin-reading text-primary">{card.reading}<span className="text-outline">•</span>
                  <span className="text-hanviet-reading uppercase tracking-wider text-secondary"><span className="sr-only">Hán Việt: </span>{card.sinoViet}</span></p>
              </div>
              <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant">HSK {card.level}</span>
            </div>
            <p className="mt-space-md text-body-lg font-medium text-on-surface">{card.meaningInContext}</p>
            {card.explanation && <p className="mt-1 text-body-md text-on-surface-variant">{card.explanation}</p>}
            <p className="mt-space-md rounded-xl bg-secondary-container/50 px-3 py-2 text-label-md text-on-secondary-container">Trong app, bạn bấm “Lưu” để thẻ này vào lịch ôn FSRS.</p>
          </article>
        )}
      </div>
    </section>
  );
}
