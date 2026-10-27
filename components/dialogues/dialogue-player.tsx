"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { DialogueDef, LevelBand } from "@/lib/dialogues/dialogue-types";
import { DialogueControls } from "./dialogue-controls";
import { DialogueLineCard } from "./dialogue-line-card";
import { DialogueTranscript } from "./dialogue-transcript";
import { useDialoguePlayback } from "./use-dialogue-playback";

interface Props {
  dialogue: DialogueDef;
  pinyin: Record<string, string>;
  level: LevelBand | null;
  sceneTitle: string | null;
}

/** Trình phát hội thoại: mỗi lần một câu (chữ Hán, pinyin, nghĩa Việt), nghe nối tiếp hoặc lặp câu, đóng vai một bên, kèm toàn văn để nhảy tới câu bất kỳ. */
export function DialoguePlayer({ dialogue, pinyin, level, sceneTitle }: Props) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showVi, setShowVi] = useState(true);
  const [loop, setLoop] = useState(false);
  const [rate, setRate] = useState(1);
  const [myRole, setMyRole] = useState<number | null>(null);
  const zh = useMemo(() => dialogue.lines.map((l) => l.zh), [dialogue]);
  const who = useMemo(() => dialogue.lines.map((l) => l.who), [dialogue]);
  const pb = useDialoguePlayback({ zh, who, loop, myRole, rate });
  const line = dialogue.lines[pb.index];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header className="flex flex-col gap-1">
        <Link href="/dialogues" className="inline-flex min-h-11 items-center gap-1 text-label-lg font-extrabold text-primary"><Icon name="arrow_back" size={20} />Tất cả hội thoại</Link>
        <h1 className="text-headline-lg">{dialogue.title.vi}</h1>
        {dialogue.title.zh && <p lang="zh-Hans" className="text-body-lg font-bold text-on-surface-variant">{dialogue.title.zh}</p>}
        <p className="text-label-lg text-on-surface-variant">{level ? `HSK ${level === 4 ? "4+" : level} · ` : ""}{dialogue.lines.length} câu · {dialogue.speakers.join(" và ")}</p>
      </header>
      <p className="text-label-lg font-extrabold" aria-live="polite">Câu {pb.index + 1} / {dialogue.lines.length}</p>
      <DialogueLineCard line={line} speaker={dialogue.speakers[line.who]} pinyin={pinyin[line.zh]} showPinyin={showPinyin} showVi={showVi} yourTurn={pb.yourTurn} />
      <DialogueControls
        playing={pb.playing} atStart={pb.atStart} atEnd={pb.atEnd}
        onToggle={pb.toggle} onPrev={() => pb.go(pb.index - 1)} onNext={() => pb.go(pb.index + 1)}
        showPinyin={showPinyin} setShowPinyin={setShowPinyin} showVi={showVi} setShowVi={setShowVi}
        loop={loop} setLoop={setLoop} rate={rate} setRate={setRate} myRole={myRole} setMyRole={setMyRole} speakers={dialogue.speakers}
      />
      <section aria-label="Toàn văn hội thoại" className="flex flex-col gap-space-sm">
        <h2 className="text-headline-md">Toàn văn</h2>
        <DialogueTranscript lines={dialogue.lines} speakers={dialogue.speakers} pinyin={pinyin} showPinyin={showPinyin} showVi={showVi} current={pb.index} onPick={pb.go} />
      </section>
      {dialogue.sceneId && sceneTitle && (
        <Link href={`/explore/${dialogue.sceneId}`} className="card-ink flex items-center gap-space-sm bg-secondary-container p-space-sm text-on-secondary-container">
          <Icon name="search" size={24} /><span className="text-body-md font-bold">Học các từ của cảnh “{sceneTitle}” trong Khám phá</span>
        </Link>
      )}
    </div>
  );
}
