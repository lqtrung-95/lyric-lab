import { Icon } from "@/components/ui/icon";

const RATES = [0.75, 1] as const;

interface ToggleProps { label: string; on: boolean; onChange: (v: boolean) => void }

function Toggle({ label, on, onChange }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`min-h-11 rounded-full border-2 border-ink px-space-sm text-label-lg font-extrabold ${on ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>
      {label}: {on ? "bật" : "tắt"}
    </button>
  );
}

interface Props {
  playing: boolean;
  atStart: boolean;
  atEnd: boolean;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  showPinyin: boolean; setShowPinyin: (v: boolean) => void;
  showVi: boolean; setShowVi: (v: boolean) => void;
  loop: boolean; setLoop: (v: boolean) => void;
  rate: number; setRate: (v: number) => void;
  myRole: number | null; setMyRole: (v: number | null) => void;
  speakers: [string, string];
}

/** Nút phát/trước/sau, công tắc pinyin, nghĩa Việt, lặp câu, tốc độ và chọn vai đóng. */
export function DialogueControls(p: Props) {
  const nav = "flex size-12 items-center justify-center rounded-full border-2 border-ink bg-surface-container-lowest disabled:opacity-40";
  return (
    <div className="flex flex-col items-center gap-space-sm">
      <div className="flex items-center gap-space-md">
        <button type="button" onClick={p.onPrev} disabled={p.atStart} aria-label="Câu trước" className={nav}><Icon name="skip_next" size={24} className="-scale-x-100" /></button>
        <button type="button" onClick={p.onToggle} aria-label={p.playing ? "Dừng" : "Nghe từ câu này"} className="flex size-16 items-center justify-center rounded-full border-2 border-ink bg-primary text-on-primary"><Icon name={p.playing ? "pause" : "play_arrow"} size={34} filled /></button>
        <button type="button" onClick={p.onNext} disabled={p.atEnd} aria-label="Câu sau" className={nav}><Icon name="skip_next" size={24} /></button>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Toggle label="Pinyin" on={p.showPinyin} onChange={p.setShowPinyin} />
        <Toggle label="Nghĩa Việt" on={p.showVi} onChange={p.setShowVi} />
        <Toggle label="Lặp câu" on={p.loop} onChange={p.setLoop} />
        <div role="group" aria-label="Tốc độ đọc" className="flex gap-1">
          {RATES.map((r) => <button key={r} type="button" aria-pressed={p.rate === r} onClick={() => p.setRate(r)} className={`min-h-11 rounded-full border-2 border-ink px-space-sm text-label-lg font-extrabold ${p.rate === r ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>{r}×</button>)}
        </div>
      </div>
      <div role="group" aria-label="Vai bạn đóng" className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-label-lg font-extrabold">Đóng vai:</span>
        {([null, 0, 1] as const).map((r) => (
          <button key={String(r)} type="button" aria-pressed={p.myRole === r} onClick={() => p.setMyRole(r)} className={`min-h-11 rounded-full border-2 border-ink px-space-sm text-label-lg font-extrabold ${p.myRole === r ? "bg-secondary text-on-secondary" : "bg-surface-container-lowest"}`}>
            {r === null ? "Chỉ nghe" : p.speakers[r]}
          </button>
        ))}
      </div>
    </div>
  );
}
