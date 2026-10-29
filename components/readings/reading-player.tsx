"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WordTapPanel } from "@/components/speaking/word-tap-panel";
import { RubyChars, RubyLine } from "@/components/ui/ruby-text";
import { alignPinyin } from "@/lib/pinyin/align-ruby";
import type { ReplyToken } from "@/lib/roleplay/segment-reply";
import type { LevelBand } from "@/lib/dialogues/dialogue-types";
import { playChineseSequence, stopChinese } from "@/lib/speech/play-chinese";
import { allSentences, type ReadingDef } from "@/lib/readings/reading-types";

const chip = "inline-flex min-h-11 items-center rounded-full border-2 border-ink px-4 text-label-md font-bold";

/**
 * Trình đọc một truyện ngắn dạng ĐOẠN VĂN liền mạch: chữ Hán có pinyin (từ từ điển), từ nào cũng bấm được để tra và lưu thẻ ôn, nghe từng đoạn hoặc cả bài
 * (câu đang đọc được tô nền), nghĩa Việt ẩn mặc định để người học tự đoán trước (bật cả bài, hoặc bấm "Nghĩa" ở từng đoạn), rồi câu hỏi đọc hiểu.
 */
export function ReadingPlayer({ reading, pinyin, tokens, level }: { reading: ReadingDef; pinyin: Record<string, string>; tokens: Record<string, ReplyToken[]>; level: LevelBand | null }) {
  const [showPinyin, setShowPinyin] = useState(true);
  const [showAllVi, setShowAllVi] = useState(false);
  const [open, setOpen] = useState<ReadonlySet<number>>(new Set());
  const [playing, setPlaying] = useState(-1);
  const [tapped, setTapped] = useState<string | null>(null);
  useEffect(() => () => stopChinese(), []);

  // Chỉ số câu toàn bài của câu đầu mỗi đoạn, để tô đúng câu đang đọc khi nghe cả bài hay một đoạn.
  const starts = reading.paragraphs.reduce<number[]>((acc, p, i) => [...acc, i === 0 ? 0 : acc[i - 1] + reading.paragraphs[i - 1].length], []);
  const flat = allSentences(reading);
  const play = (from: number, to: number) => {
    if (playing >= 0) { stopChinese(); return; }
    void playChineseSequence(flat.slice(from, to).map((s) => s.zh), (i) => setPlaying(i < 0 ? -1 : from + i));
  };
  const toggle = (i: number) => setOpen((o) => { const n = new Set(o); if (!n.delete(i)) n.add(i); return n; });

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md pb-56">
      <Link href="/readings" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Tất cả truyện</Link>
      <header>
        <h1 lang="zh-Hans" className="font-serif text-headline-lg"><span aria-hidden="true">{reading.emoji}</span> {reading.title.zh}</h1>
        <p className="text-body-md text-on-surface-variant">{reading.title.vi}{level ? ` · HSK ${level >= 6 ? "6+" : level}` : ""}</p>
      </header>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Tùy chọn đọc">
        <button type="button" onClick={() => play(0, flat.length)} className={`${chip} bg-primary-container text-on-primary-container`}>{playing >= 0 ? "Dừng" : "Nghe cả bài"}</button>
        <button type="button" aria-pressed={showPinyin} onClick={() => setShowPinyin((v) => !v)} className={`${chip} ${showPinyin ? "bg-secondary-container" : "bg-surface-container-lowest"}`}>Pinyin</button>
        <button type="button" aria-pressed={showAllVi} onClick={() => setShowAllVi((v) => !v)} className={`${chip} ${showAllVi ? "bg-secondary-container" : "bg-surface-container-lowest"}`}>Nghĩa Việt</button>
      </div>
      <p className="text-body-sm text-on-surface-variant">Bấm vào một từ (gạch chân chấm) để xem nghĩa và lưu thẻ ôn.</p>
      <article className="card-ink flex flex-col gap-space-md p-space-md">
        {reading.paragraphs.map((para, pi) => {
          const vi = showAllVi || open.has(pi);
          const from = starts[pi];
          return (
            <section key={pi} aria-label={`Đoạn ${pi + 1}`} className="flex flex-col gap-2">
              <p lang="zh-Hans" className="text-body-lg font-bold leading-[2.6]">
                {para.map((s, si) => (
                  <span key={si} aria-current={from + si === playing ? "true" : undefined} className={`rounded-md ${from + si === playing ? "bg-primary-container" : ""}`}>
                    <Sentence zh={s.zh} pinyin={showPinyin ? pinyin[s.zh] : undefined} tokens={tokens[s.zh] ?? []} active={tapped} onWord={setTapped} />
                  </span>
                ))}
              </p>
              {vi && <p className="text-body-md text-on-surface-variant">{para.map((s) => s.vi).join(" ")}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => play(from, from + para.length)} className="min-h-11 rounded-full border-2 border-ink bg-surface-container-lowest px-4 text-label-md font-bold">{playing >= 0 ? "Dừng" : "Nghe đoạn"}</button>
                {!showAllVi && <button type="button" aria-pressed={open.has(pi)} onClick={() => toggle(pi)} className="min-h-11 rounded-full px-3 text-label-md font-bold underline">{open.has(pi) ? "Ẩn nghĩa" : "Nghĩa đoạn này"}</button>}
              </div>
            </section>
          );
        })}
      </article>
      <Quiz reading={reading} />
      {tapped && (
        <div className="fixed inset-x-3 bottom-20 z-40 mx-auto max-w-xl md:bottom-6">
          <WordTapPanel key={tapped} term={tapped} onLooked={() => undefined} onClose={() => setTapped(null)} />
        </div>
      )}
    </div>
  );
}

/** Một câu chia theo từ: từ có chữ Hán là nút bấm tra nghĩa; pinyin (nếu bật) nằm ngay dưới từng chữ. Không tách được từ thì hiện câu thường. */
function Sentence({ zh, pinyin, tokens, active, onWord }: { zh: string; pinyin: string | undefined; tokens: ReplyToken[]; active: string | null; onWord: (t: string) => void }) {
  if (tokens.length === 0) return <RubyLine zh={zh} pinyin={pinyin} show={!!pinyin} />;
  const py = pinyin ? alignPinyin(zh, pinyin) : null;
  const starts = tokens.reduce<number[]>((acc, t, i) => [...acc, i === 0 ? 0 : acc[i - 1] + Array.from(tokens[i - 1].text).length], []);
  return (
    <>
      {tokens.map((t, i) => {
        const inner = py ? <RubyChars text={t.text} py={py} offset={starts[i]} /> : t.text;
        if (!t.han) return <span key={i}>{inner}</span>;
        return (
          <button key={i} type="button" onClick={() => onWord(t.text)} aria-label={`Tra từ ${t.text}`} aria-pressed={active === t.text}
            className={`mx-px inline rounded-md px-0.5 underline decoration-dotted decoration-2 underline-offset-[6px] hover:bg-primary-container/60 ${active === t.text ? "bg-secondary-container" : ""}`}>{inner}</button>
        );
      })}
    </>
  );
}

/** Câu hỏi đọc hiểu (đề bằng tiếng Việt): chọn một đáp án, có phản hồi ngay bằng chữ (không chỉ màu) và có thể làm lại. */
function Quiz({ reading }: { reading: ReadingDef }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => reading.quiz.map(() => null));
  const done = picked.every((p) => p !== null);
  const right = picked.filter((p, i) => p === reading.quiz[i].answer).length;
  return (
    <section aria-label="Đọc hiểu" className="card-ink flex flex-col gap-space-sm p-space-md">
      <h2 className="text-headline-md">Bạn hiểu bao nhiêu?</h2>
      {reading.quiz.map((q, qi) => (
        <fieldset key={qi} className="flex flex-col gap-2">
          <legend className="text-label-lg font-extrabold">{qi + 1}. {q.q}</legend>
          {q.options.map((o, oi) => {
            const sel = picked[qi] === oi;
            const reveal = picked[qi] !== null;
            const correct = oi === q.answer;
            return (
              <button key={oi} type="button" disabled={reveal} aria-pressed={sel} onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                className={`min-h-11 rounded-xl border-2 px-3 text-left text-body-md ${reveal && correct ? "border-ink bg-secondary-container font-bold" : sel ? "border-ink bg-error-container" : "border-outline-variant bg-surface-container-lowest"}`}>
                {o}{reveal && correct ? " ✓ đúng" : reveal && sel ? " ✗ chưa đúng" : ""}
              </button>
            );
          })}
        </fieldset>
      ))}
      {done && (
        <div role="status" className="flex flex-wrap items-center gap-3">
          <p className="text-label-lg font-extrabold">{right}/{reading.quiz.length} câu đúng{right === reading.quiz.length ? ". Bạn hiểu rất tốt!" : ". Đọc lại truyện rồi thử lần nữa nhé."}</p>
          <button type="button" onClick={() => setPicked(reading.quiz.map(() => null))} className={`${chip} bg-surface-container-lowest`}>Làm lại</button>
        </div>
      )}
    </section>
  );
}
