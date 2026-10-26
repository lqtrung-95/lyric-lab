"use client";

import Link from "next/link";
import { SCENES } from "@/lib/explore/scenes";
import { SCENE_EMOJI, TOWN_DISTRICTS } from "@/lib/explore/town-layout";
import type { CaseSummary } from "./explore-hub";

interface Props {
  cases: CaseSummary[];
  learned: Record<string, number>;
  fading: Record<string, number>;
  caseState: Record<string, { done: number; solved: boolean }>;
  /** Cảnh người chơi ghé gần nhất (để đặt dấu "bạn ở đây"). */
  lastScene: string | null;
}

const DIFF_DOT: Record<string, string> = { easy: "#4caf50", medium: "#f2b01e", hard: "#e0533d" };

/**
 * Thị trấn Khám phá: các khu phố như những khối nền màu, mỗi cảnh là một "tòa nhà" (biểu tượng + mái màu) kèm tiến độ từ đã học.
 * Cảnh chưa ghé thì phủ "sương mù" (mờ, dấu ?) để gợi tò mò; từ đang phai hiện 👻; chỗ vụ án bắt đầu có ghim 🕵️ (✓ khi đã giải) bấm thẳng vào vụ án.
 */
export function TownMap({ cases, learned, fading, caseState, lastScene }: Props) {
  const casesAt: Record<string, CaseSummary[]> = {};
  for (const c of cases) (casesAt[c.startScene] ??= []).push(c);
  const visited = Object.values(SCENES).filter((s) => (learned[s.id] ?? 0) > 0).length;

  return (
    <div className="flex flex-col gap-space-md">
      <p className="text-label-md text-on-surface-variant">Đã ghé {visited}/{Object.keys(SCENES).length} nơi trong thị trấn. Chạm vào một tòa nhà để vào cảnh; chạm ghim 🕵️ để mở vụ án bắt đầu ở đó.</p>
      <div className="grid gap-space-sm lg:grid-cols-2">
        {TOWN_DISTRICTS.map((d) => {
          const total = d.scenes.reduce((n, id) => n + (SCENES[id]?.objects.length ?? 0), 0);
          const got = d.scenes.reduce((n, id) => n + (learned[id] ?? 0), 0);
          return (
            <section key={d.id} aria-label={d.name} className="rounded-2xl border-[3px] border-ink p-space-sm shadow-[0_3px_0_rgba(74,46,27,0.25)]" style={{ background: d.ground }}>
              <header className="mb-2 flex items-center justify-between gap-2" style={{ color: "#4a2e1b" }}>
                <h2 className="flex items-center gap-1.5 text-label-lg font-extrabold"><span aria-hidden="true" className="text-xl">{d.emoji}</span>{d.name}</h2>
                <span className="rounded-full border-2 border-ink bg-white/70 px-2 text-label-md font-extrabold">{got}/{total} từ</span>
              </header>
              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
                {d.scenes.map((id) => {
                  const s = SCENES[id];
                  if (!s) return null;
                  const n = learned[id] ?? 0;
                  const foggy = n === 0;
                  const pins = casesAt[id] ?? [];
                  return (
                    <li key={id} className="relative">
                      <Link href={`/explore/${id}`} aria-label={`${s.title}, ${n}/${s.objects.length} từ đã học${fading[id] ? `, ${fading[id]} từ đang phai` : ""}`}
                        className="group flex min-h-[5.5rem] flex-col items-center overflow-hidden rounded-xl border-2 border-ink bg-white text-center transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-primary">
                        <span className="h-2.5 w-full" style={{ background: d.roof }} />
                        <span aria-hidden="true" className={`mt-1 text-2xl transition ${foggy ? "opacity-35 brightness-0" : ""}`}>{SCENE_EMOJI[id]}</span>
                        <span className="px-1 text-[11px] font-extrabold leading-tight text-[#4a2e1b]">{s.title}</span>
                        <span className="mx-2 mb-1.5 mt-auto h-1.5 w-[calc(100%-1rem)] overflow-hidden rounded-full bg-[#4a2e1b]/15">
                          <span className="block h-full rounded-full" style={{ width: `${(n / s.objects.length) * 100}%`, background: d.roof }} />
                        </span>
                      </Link>
                      {fading[id] > 0 && <span aria-hidden="true" className="anim-float pointer-events-none absolute -left-1 -top-2 text-lg">👻</span>}
                      {lastScene === id && <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-primary-container px-1.5 text-[10px] font-extrabold leading-4 text-on-primary-container">📍 Bạn ở đây</span>}
                      {pins.map((c, i) => (
                        <Link key={c.id} href={`/explore/cases/${c.id}`} aria-label={`Vụ án: ${c.title}${caseState[c.id]?.solved ? " (đã giải)" : ""}`}
                          className="absolute -right-1.5 flex size-7 items-center justify-center rounded-full border-2 border-ink bg-white text-sm shadow-[0_2px_0_rgba(74,46,27,0.3)] hover:scale-110"
                          style={{ top: `${-8 + i * 22}px`, outline: `3px solid ${DIFF_DOT[c.difficulty] ?? "#999"}` }}>
                          {caseState[c.id]?.solved ? "✅" : "🕵️"}
                        </Link>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
