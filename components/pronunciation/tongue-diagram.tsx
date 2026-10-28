import type { DiagramKey } from "@/lib/pronunciation/articulation-data";
import { DIAGRAM_SHAPES } from "./tongue-diagram-shapes";

const INK = "#4a2e1b";
const TEETH = "#fffaf0";
const LIP = "#e58f8f";
const TONGUE = "#f0908a";

/** Môi trên và dưới theo dạng môi; môi tròn chu ra phía trước (sang trái). */
function Lips({ kind, jaw }: { kind: "open" | "closed" | "round" | "teeth"; jaw: number }) {
  const out = kind === "round" ? -13 : 0;
  const upperY = kind === "round" ? 4 : 0;
  const lowerRaise = kind === "teeth" ? -14 : kind === "round" ? -6 : 0;
  return (
    <>
      <path d={`M${26 + out} 50 Q${22 + out} 64 ${30 + out} ${74 - upperY} Q38 78 44 72 L44 56 Z`} fill={LIP} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <g transform={`translate(0 ${jaw + lowerRaise})`}>
        <path d={`M${26 + out} 100 Q${22 + out} 112 ${32 + out} 118 Q40 120 44 112 L44 98 Z`} fill={LIP} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      </g>
    </>
  );
}

/**
 * Hình cắt dọc miệng cho một cách phát âm: môi, răng, lợi, ngạc cứng, ngạc mềm và lưỡi (màu hồng); chấm đỏ đánh dấu chỗ chạm hoặc gần nhất.
 * Hình minh họa đơn giản (không đúng tỉ lệ giải phẫu); ý nghĩa nằm ở chữ mô tả đi kèm nên `alt` lấy từ đó.
 */
export function TongueDiagram({ kind, alt, className = "" }: { kind: DiagramKey; alt: string; className?: string }) {
  const s = DIAGRAM_SHAPES[kind];
  return (
    <svg viewBox="0 0 200 160" role="img" aria-label={alt} className={className}>
      <rect x="0" y="0" width="200" height="160" rx="12" fill="#fff6e6" />
      {/* Họng và vòm miệng */}
      <path d="M46 56 L50 56 Q56 50 62 54 Q64 52 66 52 Q100 26 128 32 Q150 38 154 56 L158 70 Q166 100 160 150" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M152 58 Q156 70 150 70 Q146 66 150 58Z" fill={LIP} stroke={INK} strokeWidth={1.5} />
      {/* Lưỡi */}
      <path d={s.tongue} fill={TONGUE} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      {/* Răng */}
      <path d="M42 54 L52 54 L52 76 Q47 80 42 76 Z" fill={TEETH} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <g transform={`translate(0 ${s.jaw})`}>
        <path d="M42 96 L52 96 L52 114 Q47 118 42 114 Z" fill={TEETH} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        <path d="M52 118 Q100 134 150 144" fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" />
      </g>
      <Lips kind={s.lips} jaw={s.jaw} />
      {/* Nhãn vùng */}
      <g fontSize="8" fill={INK} fontFamily="sans-serif" fontWeight="600">
        <text x="52" y="46">lợi</text>
        <text x="66" y="18">ngạc cứng</text>
        <text x="124" y="18">ngạc mềm</text>
      </g>
      {s.contact && <circle cx={s.contact.x} cy={s.contact.y} r="5" fill="#d42f2f" stroke="#fff" strokeWidth={1.5} />}
    </svg>
  );
}
