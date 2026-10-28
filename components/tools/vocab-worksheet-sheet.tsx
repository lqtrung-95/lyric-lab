import { hanHint, letterOf, type MatchExercise, type SheetOptions, type VocabItem } from "@/lib/tools/vocab-worksheet";

const KAI = '"Kaiti SC", "KaiTi", "STKaiti", "Noto Serif SC", "Songti SC", serif';
const H2 = "mb-2 text-[13pt] font-bold";

interface Props { title: string; items: VocabItem[]; options: SheetOptions; matchPinyin: MatchExercise | null; matchMeaning: MatchExercise | null }

/** Phần bài nối: cột trái là chữ Hán đánh số, cột phải đã xáo trộn đánh chữ cái; học sinh ghi chữ cái vào chỗ trống. */
function Matching({ heading, left, right }: { heading: string; left: string[]; right: string[] }) {
  return (
    <section className="break-inside-avoid">
      <h2 className={H2}>{heading}</h2>
      <p className="mb-2 text-[10pt] text-neutral-600">Ghi chữ cái ở cột bên phải vào chỗ trống cho đúng cặp.</p>
      <div className="grid grid-cols-2 gap-x-10">
        <ol className="space-y-1.5">{left.map((l, i) => <li key={i} className="flex items-baseline gap-2"><span className="w-6 text-[10pt] text-neutral-500">{i + 1}.</span><span lang="zh-Hans" style={{ fontFamily: KAI }} className="min-w-16 text-[16pt]">{l}</span><span className="inline-block w-12 border-b border-neutral-800" /></li>)}</ol>
        <ol className="space-y-1.5">{right.map((r, i) => <li key={i} className="flex items-baseline gap-2 text-[12pt]"><span className="w-6 font-bold">{letterOf(i)}.</span><span>{r}</span></li>)}</ol>
      </div>
    </section>
  );
}

/** Tờ bài tập từ vựng dạng HTML (in thẳng ra A4): nối chữ với pinyin hoặc nghĩa, viết pinyin, viết chữ Hán, và trang đáp án. */
export function VocabWorksheetSheet({ title, items, options, matchPinyin, matchMeaning }: Props) {
  const zhs = items.map((i) => i.zh);
  return (
    <article id="vocab-sheet" className="mx-auto w-full max-w-[210mm] space-y-6 rounded-lg border border-outline-variant bg-white p-6 text-neutral-900 shadow-sm print:max-w-none print:space-y-5 print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="flex items-end justify-between gap-4 border-b-2 border-neutral-800 pb-2">
        <h1 className="text-[16pt] font-bold">{title || "Bài tập từ vựng"}</h1>
        <p className="text-[10pt] text-neutral-600">Tên: ______________ Ngày: ________</p>
      </header>
      {options.matchPinyin && matchPinyin && <Matching heading="Nối chữ Hán với pinyin" left={zhs} right={matchPinyin.right} />}
      {options.matchMeaning && matchMeaning && <Matching heading="Nối chữ Hán với nghĩa" left={zhs} right={matchMeaning.right} />}
      {options.writePinyin && (
        <section className="break-inside-avoid">
          <h2 className={H2}>Viết pinyin (có dấu thanh) cho từng từ</h2>
          <ol className="space-y-2">{items.map((it, i) => <li key={i} className="flex items-baseline gap-2"><span className="w-6 text-[10pt] text-neutral-500">{i + 1}.</span><span lang="zh-Hans" style={{ fontFamily: KAI }} className="w-28 text-[16pt]">{it.zh}</span><span className="inline-block h-5 flex-1 border-b border-neutral-800" /></li>)}</ol>
        </section>
      )}
      {options.writeHan && (
        <section className="break-inside-avoid">
          <h2 className={H2}>Nhìn pinyin, viết chữ Hán vào các ô</h2>
          <ol className="space-y-2.5">{items.map((it, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="w-6 text-[10pt] text-neutral-500">{i + 1}.</span>
              <span className="w-36 text-[12pt]">{it.pinyin}{hanHint(it) && <span className="block text-[9pt] text-neutral-500">{hanHint(it)}</span>}</span>
              <span className="flex gap-1">{[...it.zh].map((_, k) => <span key={k} className="inline-block size-10 border border-neutral-700" />)}</span>
            </li>
          ))}</ol>
        </section>
      )}
      {options.answerKey && (
        <section className="break-before-page space-y-3 border-t-2 border-dashed border-neutral-400 pt-4 print:border-0 print:pt-0">
          <h2 className="text-[14pt] font-bold">Đáp án</h2>
          {options.matchPinyin && matchPinyin && <p className="text-[11pt]"><b>Nối chữ với pinyin:</b> {matchPinyin.answers.map((a, i) => `${i + 1}-${a}`).join("  ")}</p>}
          {options.matchMeaning && matchMeaning && <p className="text-[11pt]"><b>Nối chữ với nghĩa:</b> {matchMeaning.answers.map((a, i) => `${i + 1}-${a}`).join("  ")}</p>}
          <table className="w-full text-left text-[11pt]">
            <thead><tr className="border-b border-neutral-400"><th className="py-1 pr-3">#</th><th className="pr-3">Chữ Hán</th><th className="pr-3">Pinyin</th><th className="pr-3">Hán Việt</th><th>Nghĩa</th></tr></thead>
            <tbody>{items.map((it, i) => <tr key={i} className="border-b border-neutral-200"><td className="py-1 pr-3">{i + 1}</td><td lang="zh-Hans" style={{ fontFamily: KAI }} className="pr-3 text-[14pt]">{it.zh}</td><td className="pr-3">{it.pinyin}</td><td className="pr-3">{it.sinoViet ?? ""}</td><td>{it.meaning ?? ""}</td></tr>)}</tbody>
          </table>
        </section>
      )}
    </article>
  );
}
