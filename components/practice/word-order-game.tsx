"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import { playSfx } from "@/lib/feedback/sfx";
import { wrongPositions, type OrderItem } from "@/lib/practice/word-order";

const chip = "min-h-12 rounded-xl border-2 border-ink px-4 text-body-lg font-bold";

/**
 * Xếp câu: đề là nghĩa tiếng Việt, người chơi bấm các thẻ từ tiếng Trung theo đúng thứ tự để ghép thành câu. Bấm thẻ đã đặt để bỏ ra.
 * "Gợi ý" đặt sẵn thẻ đúng tiếp theo. Tính "đúng ngay lần đầu" khi không sai lần nào và không dùng gợi ý. Câu lấy từ các hội thoại.
 */
export function WordOrderGame({ items }: { items: OrderItem[] }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]); // chỉ số thẻ (trong item.tiles) theo thứ tự đã đặt
  const [wrong, setWrong] = useState<number[]>([]);
  const [solved, setSolved] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [firstTry, setFirstTry] = useState(0);
  const done = i >= items.length;

  if (done || items.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-lg text-center" data-testid="wo-done">
        <p className="font-serif text-headline-md">{items.length === 0 ? "Chưa tải được câu để xếp." : `Đúng ngay lần đầu ${firstTry}/${items.length} câu`}</p>
        <button type="button" onClick={() => router.refresh()} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">Chơi bộ khác</button>
      </div>
    );
  }
  const item = items[i];
  const answer = placed.map((idx) => item.tiles[idx]);
  const next = () => { setI((n) => n + 1); setPlaced([]); setWrong([]); setSolved(false); setMistakes(0); setHints(0); };

  function place(idx: number) { if (!solved && !placed.includes(idx)) { setPlaced((p) => [...p, idx]); setWrong([]); } }
  function remove(pos: number) { if (!solved) { setPlaced((p) => p.filter((_, k) => k !== pos)); setWrong([]); } }
  function check() {
    const bad = wrongPositions(answer, item.tokens);
    if (bad.length === 0) {
      setSolved(true);
      if (mistakes === 0 && hints === 0) setFirstTry((n) => n + 1);
      playSfx("correct");
    } else {
      setWrong(bad); setMistakes((m) => m + 1); playSfx("wrong");
    }
  }
  /** Gợi ý: giữ phần đang đúng liên tiếp từ đầu, bỏ phần còn lại rồi đặt thẻ đúng kế tiếp. */
  function hint() {
    let good = 0;
    while (good < placed.length && item.tiles[placed[good]] === item.tokens[good]) good++;
    const base = placed.slice(0, good);
    const want = item.tokens[base.length];
    const idx = item.tiles.findIndex((w, k) => w === want && !base.includes(k));
    if (idx >= 0) { setPlaced([...base, idx]); setWrong([]); setHints((h) => h + 1); }
  }

  return (
    <div className="flex flex-col gap-space-md">
      <p className="text-label-lg font-extrabold">Câu {i + 1}/{items.length}</p>
      <p className="text-body-lg font-bold">Xếp các thẻ thành câu tiếng Trung có nghĩa: <span className="text-primary">{item.vi}</span></p>
      <div aria-label="Câu của bạn" className="flex min-h-16 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed border-ink bg-surface-container-lowest p-space-sm">
        {placed.length === 0 && <span className="text-body-md text-on-surface-variant">Bấm các thẻ bên dưới theo thứ tự.</span>}
        {placed.map((idx, pos) => (
          <button key={idx} type="button" onClick={() => remove(pos)} lang="zh-Hans" aria-label={`Bỏ thẻ ${item.tiles[idx]}`}
            className={`${chip} ${wrong.includes(pos) ? "border-error bg-error-container" : solved ? "border-secondary bg-secondary-container" : "bg-primary-container text-on-primary-container"}`}>{item.tiles[idx]}</button>
        ))}
      </div>
      {!solved && (
        <div aria-label="Các thẻ từ" className="flex flex-wrap gap-2">
          {item.tiles.map((w, idx) => (
            <button key={idx} type="button" lang="zh-Hans" disabled={placed.includes(idx)} onClick={() => place(idx)} className={`${chip} bg-surface-container-lowest disabled:opacity-30`}>{w}</button>
          ))}
        </div>
      )}
      {wrong.length > 0 && <p role="alert" className="text-label-md font-bold text-error">Chưa đúng, các thẻ màu đỏ đang sai chỗ. Bấm thẻ để bỏ ra rồi đặt lại, hoặc dùng Gợi ý.</p>}
      {solved ? (
        <div role="status" className="rounded-xl bg-secondary-container p-space-sm text-on-secondary-container">
          <p className="flex items-center gap-2 text-body-lg font-bold" lang="zh-Hans"><span className="min-w-0 flex-1 leading-[2.2]"><RubyLine zh={item.zh} pinyin={item.pinyin} show /></span><PronounceButton text={item.zh} className="size-11" /></p>
          <button type="button" onClick={next} className="mt-2 min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:brightness-110">{i + 1 === items.length ? "Xem kết quả" : "Câu tiếp"}</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={check} disabled={placed.length !== item.tiles.length} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-medium text-on-primary disabled:opacity-40">Kiểm tra</button>
          <button type="button" onClick={hint} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-5 text-label-md font-bold">Gợi ý</button>
        </div>
      )}
    </div>
  );
}
