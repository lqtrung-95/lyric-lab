"use client";

import { useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { savedItemForWord } from "@/lib/explore/saved-item";
import { sfx } from "@/lib/games/arcade-sfx";
import { PET_ADVENTURE_EVENT, PET_ADVENTURE_KEY, adventurePhase, minutesLeft, parseAdventure, startAdventure, type Adventure } from "@/lib/pet/pet-adventure";
import { playChinese } from "@/lib/speech/play-chinese";
import { itemKey } from "@/lib/user-state/learner-state";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useLocalJson } from "./use-local-json-store";

/** Chuyến phiêu lưu hiện tại của pet (lưu ở thiết bị này). null = chưa có chuyến nào. */
export function usePetAdventure() {
  const [adventure, setAdventure] = useLocalJson<Adventure | null>(PET_ADVENTURE_KEY, PET_ADVENTURE_EVENT, parseAdventure, null);
  return { adventure, setAdventure };
}

/** Pet đang đi chơi: thay cho hình pet trong thẻ. Chỉ trang trí, thông tin nằm ở chữ bên cạnh. */
export function AwayPlaceholder({ title }: { title: string }) {
  return (
    <div aria-hidden="true" className="flex size-28 shrink-0 flex-col items-center justify-center rounded-full bg-surface-container text-center" title={title}>
      <span className="text-3xl">🧳</span>
      <span className="text-label-md font-bold">Đi chơi</span>
    </div>
  );
}

const MOOD_OK = "Hôm nay bạn đã đạt mục tiêu, cho bạn nhỏ đi chơi nhé!";

/**
 * Khối phiêu lưu trong thẻ pet: nút cho đi (khi đủ điều kiện), trạng thái đang đi, và quà khi pet về.
 * `today` = ngày hiện tại theo múi giờ người dùng; `now` = 0 nghĩa là chưa biết giờ (chưa hiện gì). Từ quà chỉ vào bộ ôn khi người dùng bấm.
 */
export function PetAdventure({ name, species, adventure, now, today, canGo, onChange, onFx }: {
  name: string; species: string; adventure: Adventure | null; now: number; today: string | null; canGo: boolean;
  /** `null` = gọi pet về sớm, hủy chuyến (không có quà, hôm nay được cho đi lại). */ onChange: (a: Adventure | null) => void; onFx: (kind: "adopt" | "gift") => void;
}) {
  const { state, toggleSaved, markKnown } = useLearnerState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [asking, setAsking] = useState<"go" | "recall" | null>(null);
  if (now === 0 || !today) return null;
  const phase = adventure ? adventurePhase(adventure, now) : null;

  const go = async () => {
    setAsking(null);
    setBusy(true); setError(false); sfx.petBlip();
    try {
      const res = await fetch(`/api/pet/adventure?seed=${encodeURIComponent(`${today}:${species}`)}`);
      if (!res.ok) throw new Error("bad_status");
      const trip = (await res.json()) as { sceneId: string; title: string; words: Adventure["words"] };
      onChange(startAdventure(trip, today, Date.now()));
      onFx("adopt");
    } catch { setError(true); } finally { setBusy(false); }
  };

  if (phase === "away" && adventure) {
    return (
      <div className="basis-full rounded-2xl bg-surface-container-low p-space-sm">
        <p role="status" className="text-body-md">{name} đang đi chơi ở <b>{adventure.title}</b>. Còn khoảng {minutesLeft(adventure, now)} phút nữa là về, mang quà cho bạn đấy!</p>
        <button type="button" onClick={() => { sfx.petBlip(); setAsking("recall"); }} className="mt-1 min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">Gọi {name} về sớm</button>
        <ConfirmDialog
          open={asking === "recall"} tone="primary" title={`Gọi ${name} về sớm?`} confirmLabel={`Gọi ${name} về`} cancelLabel="Để bạn ấy chơi tiếp"
          body={`${name} sẽ về ngay nhưng chưa kịp mang quà. Hôm nay bạn vẫn cho ${name} đi chơi lại được.`}
          onCancel={() => setAsking(null)} onConfirm={() => { setAsking(null); sfx.petCheer(); onChange(null); onFx("adopt"); }}
        />
      </div>
    );
  }
  if (phase === "back" && adventure) {
    return (
      <div className="basis-full rounded-2xl bg-secondary-container p-space-sm text-on-secondary-container" role="group" aria-label={`Quà phiêu lưu của ${name}`}>
        <p className="text-label-md font-bold">{name} đi chơi ở {adventure.title} về rồi, mang quà cho bạn!</p>
        <ul className="mt-1 flex flex-col gap-2">
          {adventure.words.map((w) => {
            const key = itemKey({ type: "vocab", term: w.term });
            const saved = state.saved.some((s) => s.key === key);
            const known = state.known.includes(key);
            return (
              <li key={w.id} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span lang="zh" className="font-serif text-hanzi-display">{w.term}</span>
                <span className="text-pinyin-reading">{w.pinyin}</span>
                <span className="text-body-md">{w.gloss}</span>
                <button type="button" onClick={() => void playChinese(w.term)} className="min-h-11 rounded-full px-3 text-label-md font-bold underline">Nghe</button>
                {known ? <span className="text-label-md font-bold">Đã biết</span> : (
                  <>
                    <button type="button" aria-pressed={saved} onClick={() => { sfx.petBlip(); toggleSaved(savedItemForWord(w)); }} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-3 text-label-md font-bold">{saved ? "Đã thêm vào bộ ôn" : "Thêm vào bộ ôn"}</button>
                    {!saved && <button type="button" onClick={() => { sfx.petBlip(); markKnown(key); }} className="min-h-11 rounded-full px-3 text-label-md font-bold underline">Mình đã biết</button>}
                  </>
                )}
              </li>
            );
          })}
        </ul>
        <button type="button" onClick={() => { sfx.petCheer(); onChange({ ...adventure, taken: true }); onFx("gift"); }} className="mt-2 min-h-11 rounded-full border-2 border-ink bg-primary-container px-4 text-label-md font-bold">Cảm ơn {name}!</button>
      </div>
    );
  }
  if (!canGo) return null;
  return (
    <div className="basis-full">
      <p className="text-body-md">{MOOD_OK}</p>
      <Button3d type="button" variant="bright" className="mt-1" disabled={busy} onClick={() => { sfx.petBlip(); setAsking("go"); }}>{busy ? "Đang chuẩn bị…" : `Cho ${name} đi phiêu lưu`}</Button3d>
      <ConfirmDialog
        open={asking === "go"} tone="primary" title={`Cho ${name} đi chơi?`} confirmLabel="Đồng ý cho đi" cancelLabel="Để sau"
        body={`Khi ${name} đi chơi (khoảng một giờ), bạn sẽ không tương tác được với ${name}: không cho ăn, nói chuyện, dạy hay xem nhà. Bạn vẫn gọi ${name} về sớm được, nhưng khi đó ${name} chưa kịp mang quà.`}
        onCancel={() => setAsking(null)} onConfirm={() => void go()}
      />
      {error && <p role="alert" className="mt-1 text-label-md text-error">Chưa chuẩn bị được chuyến đi. Kiểm tra kết nối rồi thử lại nhé.</p>}
    </div>
  );
}
