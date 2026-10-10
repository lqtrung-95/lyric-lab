import { InlineBoldText } from "./inline-bold-text";

type Block = { kind: "p"; lines: string[] } | { kind: "ul" | "ol"; items: string[] };

const BULLET = /^\s*[-•*]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;

/** Chia câu trả lời của AI thành đoạn văn, danh sách gạch đầu dòng và danh sách đánh số theo từng dòng (dòng trống ngăn đoạn). */
export function parseAnswerBlocks(text: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) { blocks.push({ kind: "p", lines: [] }); continue; }
    const bullet = line.match(BULLET);
    const numbered = bullet ? null : line.match(NUMBERED);
    const kind = bullet ? "ul" : numbered ? "ol" : "p";
    const last = blocks.at(-1);
    if (kind === "p") {
      if (last?.kind === "p") last.lines.push(line); else blocks.push({ kind: "p", lines: [line] });
    } else {
      const item = (bullet ?? numbered)![1];
      if (last?.kind === kind) last.items.push(item); else blocks.push({ kind, items: [item] });
    }
  }
  return blocks.filter((b) => (b.kind === "p" ? b.lines.length > 0 : true));
}

/** Hiển thị câu trả lời của AI cho dễ đọc: đoạn ngắn cách nhau, danh sách có dấu đầu dòng/số, chữ **đậm**. Không dựng HTML từ nội dung nên an toàn. */
export function FormattedAnswer({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-label-md leading-6 text-on-surface-variant">
      {parseAnswerBlocks(text).map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>{b.lines.map((l, k) => <span key={k} className="block"><InlineBoldText text={l} /></span>)}</p>
        ) : b.kind === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5 marker:text-primary">{b.items.map((it, k) => <li key={k}><InlineBoldText text={it} /></li>)}</ul>
        ) : (
          <ol key={i} className="list-decimal space-y-1 pl-5 marker:text-primary">{b.items.map((it, k) => <li key={k}><InlineBoldText text={it} /></li>)}</ol>
        ))}
    </div>
  );
}
