"use client";

import { useMemo, useState } from "react";
import { GamePet, type GamePetEvent } from "@/components/games/game-pet";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { Button3d } from "@/components/ui/button-3d";
import { sfx } from "@/lib/games/arcade-sfx";
import type { ForgeData } from "@/lib/games/load-radical-recipes";
import { combine, forgeProgress, hint, parseFound, type Recipe } from "@/lib/games/radical-forge";
import { itemKey } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { ForgeCard } from "./radical-forge-card";

const KEY = "lyric-lab-radical-found";
const NONE: string[] = [];
const FORGE_CSS = `@media (prefers-reduced-motion: no-preference) { @keyframes forge-pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.06) } 100% { transform: scale(1); opacity: 1 } } @keyframes forge-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-6px) } 75% { transform: translateX(6px) } } .forge-new { animation: forge-pop .45s ease-out } .forge-shake { animation: forge-shake .3s } }`;

/**
 * Ghép bộ thủ: chạm hai mảnh để ghép thành chữ mới (日 + 月 = 明). Chữ tìm được lưu ở thiết bị này, mỗi chữ có pinyin, Hán Việt, nghĩa Việt
 * và nút thêm vào bộ ôn. Có gợi ý khi bí và chia sẻ tiến độ. Không ghi XP.
 */
export function RadicalForgeGame({ data }: { data: ForgeData }) {
  const [found, setFound] = useLocalJson(KEY, KEY, parseFound, NONE);
  const { state, toggleSaved } = useLearnerState();
  const [a, setA] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [fresh, setFresh] = useState<string[]>([]);
  const [pair, setPair] = useState<[string, string]>(["", ""]);
  const [shake, setShake] = useState(0);
  const [petEv, setPetEv] = useState<GamePetEvent | null>(null);
  const [tip, setTip] = useState<Recipe | null>(null);
  const have = useMemo(() => new Set([...data.start, ...found]), [data.start, found]);
  const items = useMemo(() => [...data.start, ...found.filter((c) => !data.start.includes(c))], [data.start, found]);
  const { done, total } = forgeProgress(data.recipes, have);
  const react = (kind: GamePetEvent["kind"]) => setPetEv((e) => ({ key: (e?.key ?? 0) + 1, kind }));

  const tap = (c: string) => {
    setTip(null);
    if (a === null) { setA(c); sfx.petBlip(); return; }
    const outs = combine(data.recipes, a, c);
    const added = outs.filter((o) => !have.has(o));
    setA(null);
    if (outs.length === 0) { setMsg(`${a} + ${c} không ghép được. Thử cặp khác nhé!`); setShake((n) => n + 1); sfx.buzz(); react("miss"); return; }
    if (added.length === 0) { setMsg(`${a} + ${c} = ${outs.join(", ")}: chữ này bạn có rồi.`); setFresh([]); sfx.petBlip(); return; }
    setFound([...found, ...added]);
    setFresh(added);
    setPair([a, c]);
    setMsg(`${a} + ${c} = ${added.join(" và ")}!`);
    sfx.pop(added.length); react(added.length > 1 ? "combo" : "hit");
  };
  const showHint = () => { const r = hint(data.recipes, have, (n) => Math.floor(Math.random() * n)); setTip(r); setMsg(r ? null : "Bạn đã ghép hết các chữ ghép được từ bộ hiện có. Giỏi quá!"); };
  const share = async () => {
    const text = `Mình đã ghép được ${done}/${total} chữ Hán từ các bộ thủ trên SongHanzi. Thử xem bạn ghép được bao nhiêu!`;
    const url = `${window.location.origin}/review/ghep-bo-thu`;
    try {
      if (navigator.share) await navigator.share({ title: "Ghép bộ thủ", text, url });
      else { await navigator.clipboard.writeText(`${text} ${url}`); setMsg("Đã sao chép lời mời."); }
    } catch (e) { if (!(e instanceof DOMException && e.name === "AbortError")) setMsg("Chưa chia sẻ được. Thử lại nhé."); }
  };

  if (data.recipes.length === 0) return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được dữ liệu chữ. Thử tải lại trang nhé.</p>;
  return (
    <div className="mx-auto max-w-2xl">
      <style>{FORGE_CSS}</style>
      <div className="flex flex-wrap items-center gap-3">
        <GamePet event={petEv} />
        <div className="min-w-[10rem] flex-1">
          <p className="text-label-lg font-extrabold">Đã ghép {done}/{total} chữ</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-container-high" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Tiến độ ghép chữ"><div className="h-full rounded-full bg-primary" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
        </div>
        <Button3d type="button" onClick={showHint}>Gợi ý</Button3d>
        <Button3d type="button" variant="bright" onClick={() => void share()}>Khoe</Button3d>
      </div>
      <div key={shake} className={`mt-space-sm flex items-center justify-center gap-2 rounded-2xl bg-surface-container-low p-space-sm text-hanzi-display font-serif ${shake ? "forge-shake" : ""}`} aria-hidden="true">
        <span className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-ink">{a ?? "?"}</span>
        <span>+</span><span className="flex size-16 items-center justify-center rounded-2xl border-2 border-dashed border-ink">?</span>
      </div>
      <p role="status" aria-live="polite" className="mt-1 min-h-6 text-center text-body-md font-bold">{tip ? `Gợi ý: thử ghép ${tip.a} với ${tip.b}.` : a ? `Đã chọn ${a}${data.info[a] ? ` (${data.info[a].pinyin}: ${data.info[a].meaning})` : ""}. Chọn mảnh thứ hai.` : (msg ?? "Chạm hai mảnh để ghép thành chữ mới.")}</p>
      {fresh.length > 0 && <ul className="mt-space-sm flex flex-col gap-2">{fresh.map((c) => <ForgeCard key={c} han={c} info={data.info[c]} parts={pair} infoOf={(x) => data.info[x]} ety={data.ety[c]} saved={state.saved.some((s) => s.key === itemKey({ type: "vocab", term: c }))} onToggleSave={toggleSaved} />)}</ul>}
      <h2 className="mt-space-md text-label-lg font-extrabold">Kho mảnh ghép ({items.length})</h2>
      <ul className="mt-1 grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2">
        {items.map((c) => (
          <li key={c}>
            <button type="button" lang="zh" aria-pressed={a === c} aria-label={`Chọn ${c}${data.info[c] ? `, ${data.info[c].meaning}` : ""}`} title={data.info[c]?.meaning} onClick={() => tap(c)} className={`flex min-h-16 w-full flex-col items-center justify-center rounded-2xl border-2 font-serif text-hanzi-display ${a === c ? "border-primary bg-primary-container" : "border-ink bg-surface-container-lowest"} ${fresh.includes(c) ? "forge-new" : ""}`}>
              {c}
              {data.info[c] && <span className="font-sans text-[0.7rem] font-medium leading-none text-on-surface-variant">{data.info[c].pinyin}</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
