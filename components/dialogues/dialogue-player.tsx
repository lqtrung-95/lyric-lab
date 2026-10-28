"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { DialogueDef, LevelBand } from "@/lib/dialogues/dialogue-types";
import { DialogueControls } from "./dialogue-controls";
import { DialogueLineCard } from "./dialogue-line-card";
import { DialogueRecordingPanel } from "./dialogue-recording-panel";
import { DialogueTranscript } from "./dialogue-transcript";
import { playFullDialogue, stopFullDialogue } from "./play-full-dialogue";
import { useDialogueRecorder } from "./use-dialogue-recorder";
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
  const rec = useDialogueRecorder();
  const [replaying, setReplaying] = useState(false);
  const line = dialogue.lines[pb.index];
  const mineCount = myRole === null ? 0 : who.filter((w) => w === myRole).length;
  const recordedCount = myRole === null ? 0 : who.filter((w, i) => w === myRole && rec.recordings[i]).length;

  useEffect(() => () => stopFullDialogue(), []);

  const changeRole = (r: number | null) => { stopFullDialogue(); setReplaying(false); rec.clear(); setMyRole(r); };
  const move = (i: number) => { rec.stop(); stopFullDialogue(); setReplaying(false); pb.go(i); };
  const replayAll = () => {
    pb.stop();
    setReplaying(true);
    const lines = dialogue.lines.map((l, i) => ({ zh: l.zh, recordingUrl: l.who === myRole ? rec.recordings[i] : undefined }));
    void playFullDialogue(lines, rate, (i) => { if (i >= 0) pb.show(i); else setReplaying(false); });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header className="flex flex-col gap-1">
        <Link href="/dialogues" className="inline-flex min-h-11 items-center gap-1 text-label-lg font-extrabold text-primary"><Icon name="arrow_back" size={20} />Tất cả hội thoại</Link>
        <h1 className="text-headline-lg">{dialogue.title.vi}</h1>
        {dialogue.title.zh && <p lang="zh-Hans" className="text-body-lg font-bold text-on-surface-variant">{dialogue.title.zh}</p>}
        <p className="text-label-lg text-on-surface-variant">{level ? `HSK ${level === 6 ? "6+" : level} · ` : ""}{dialogue.lines.length} câu · {dialogue.speakers.join(" và ")}</p>
      </header>
      <p className="text-label-lg font-extrabold" aria-live="polite">Câu {pb.index + 1} / {dialogue.lines.length}</p>
      <DialogueLineCard line={line} speaker={dialogue.speakers[line.who]} pinyin={pinyin[line.zh]} showPinyin={showPinyin} showVi={showVi} yourTurn={pb.yourTurn} />
      <DialogueControls
        playing={pb.playing} atStart={pb.atStart} atEnd={pb.atEnd}
        onToggle={() => { rec.stop(); stopFullDialogue(); setReplaying(false); pb.toggle(); }} onPrev={() => move(pb.index - 1)} onNext={() => move(pb.index + 1)}
        showPinyin={showPinyin} setShowPinyin={setShowPinyin} showVi={showVi} setShowVi={setShowVi}
        loop={loop} setLoop={setLoop} rate={rate} setRate={setRate} myRole={myRole} setMyRole={changeRole} speakers={dialogue.speakers}
      />
      {myRole !== null && (
        <DialogueRecordingPanel
          yourTurn={pb.yourTurn} recording={rec.recordingIndex === pb.index} currentRecording={rec.recordings[pb.index]}
          recordedCount={recordedCount} totalMine={mineCount} replaying={replaying} error={rec.error}
          onRecord={() => void rec.start(pb.index)} onStopRecord={rec.stop}
          onReplayAll={replayAll} onStopReplay={() => { stopFullDialogue(); setReplaying(false); }}
        />
      )}
      <section aria-label="Toàn văn hội thoại" className="flex flex-col gap-space-sm">
        <h2 className="text-headline-md">Toàn văn</h2>
        <DialogueTranscript lines={dialogue.lines} speakers={dialogue.speakers} pinyin={pinyin} showPinyin={showPinyin} showVi={showVi} current={pb.index} onPick={move} />
      </section>
      {dialogue.sceneId && sceneTitle && (
        <Link href={`/explore/${dialogue.sceneId}`} className="card-ink flex items-center gap-space-sm bg-secondary-container p-space-sm text-on-secondary-container">
          <Icon name="search" size={24} /><span className="text-body-md font-bold">Học các từ của cảnh “{sceneTitle}” trong Khám phá</span>
        </Link>
      )}
    </div>
  );
}
