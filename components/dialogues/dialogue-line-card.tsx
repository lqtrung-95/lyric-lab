import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import type { DialogueLine } from "@/lib/dialogues/dialogue-types";

const AVATAR = ["bg-primary-container text-on-primary-container", "bg-secondary-container text-on-secondary-container"] as const;

interface Props {
  line: DialogueLine;
  speaker: string;
  pinyin: string | undefined;
  showPinyin: boolean;
  showVi: boolean;
  yourTurn: boolean;
}

/** Thẻ một câu đang chọn: người nói, chữ Hán (có pinyin dưới từng chữ khi bật), nghĩa Việt, nút nghe lại. */
export function DialogueLineCard({ line, speaker, pinyin, showPinyin, showVi, yourTurn }: Props) {
  return (
    <section aria-live="polite" className={`card-ink flex flex-col gap-space-sm p-space-md ${yourTurn ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container-lowest"}`}>
      <div className="flex items-center gap-2">
        <span aria-hidden className={`flex size-10 items-center justify-center rounded-full border-2 border-ink text-body-lg font-extrabold ${AVATAR[line.who % 2]}`}>{speaker.slice(0, 1)}</span>
        <p className="text-label-lg font-extrabold">{speaker}{yourTurn && <span className="ml-2 rounded-full border-2 border-ink bg-white px-2 py-0.5 text-label-md text-[#4a2e1b]">Đến lượt bạn: đọc to câu này</span>}</p>
        <PronounceButton text={line.zh} className="ml-auto size-11" />
      </div>
      <p lang="zh-Hans" className="text-headline-md font-bold leading-[2.3]"><RubyLine zh={line.zh} pinyin={pinyin} show={showPinyin} /></p>
      {showVi && <p className="text-body-lg text-on-surface-variant">{line.vi}</p>}
    </section>
  );
}
