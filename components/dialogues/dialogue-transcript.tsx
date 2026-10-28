import { RubyLine } from "@/components/ui/ruby-text";
import type { DialogueLine } from "@/lib/dialogues/dialogue-types";

interface Props {
  lines: DialogueLine[];
  speakers: [string, string];
  pinyin: Record<string, string>;
  showPinyin: boolean;
  showVi: boolean;
  current: number;
  onPick: (index: number) => void;
}

/** Toàn bộ hội thoại dạng bong bóng trái/phải; bấm một câu để nhảy tới câu đó. Câu đang chọn được viền đậm và đánh dấu bằng chữ ("đang chọn") chứ không chỉ bằng màu. */
export function DialogueTranscript({ lines, speakers, pinyin, showPinyin, showVi, current, onPick }: Props) {
  return (
    <ol className="flex flex-col gap-2">
      {lines.map((l, i) => (
        <li key={i} className={`flex ${l.who === 1 ? "justify-end" : "justify-start"}`}>
          <button
            type="button"
            onClick={() => onPick(i)}
            aria-current={i === current ? "true" : undefined}
            className={`min-h-11 max-w-[92%] rounded-2xl border-2 px-space-sm py-2 text-left sm:max-w-[78%] ${i === current ? "border-ink bg-primary-container text-on-primary-container" : "border-outline-variant bg-surface-container-lowest"}`}
          >
            <span className="block text-label-md font-extrabold opacity-80">{speakers[l.who]}{i === current && " · đang chọn"}</span>
            <span lang="zh-Hans" className="block text-body-lg font-bold leading-[2.1]"><RubyLine zh={l.zh} pinyin={pinyin[l.zh]} show={showPinyin} rtClassName="[&_rt]:text-current [&_rt]:opacity-80" fallbackClassName="opacity-90" /></span>
            {showVi && <span className="mt-1 block text-body-sm opacity-80">{l.vi}</span>}
          </button>
        </li>
      ))}
    </ol>
  );
}
