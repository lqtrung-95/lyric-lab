import Link from "next/link";
import { layoutWordMap, MAP_HEIGHT, MAP_WIDTH, type MapGroup } from "@/lib/tra-tu/word-map-layout";
import { wordHref } from "./word-result-row";

const COLORS = { compound: "var(--primary)", radical: "var(--secondary)", theme: "var(--tertiary)" } as const;

/**
 * Bản đồ từ vựng liên quan: từ đang xem ở giữa, ba nhóm toả ra (từ ghép, chữ cùng bộ thủ, từ cùng chủ đề). Mỗi nút là liên kết sang trang của từ đó (vùng bấm 44px).
 * Nhóm phân biệt bằng nhãn chữ chứ không chỉ bằng màu; danh sách đầy đủ (kèm pinyin, nghĩa) có ngay bên dưới cho người dùng đọc màn hình và để xem rõ hơn.
 */
export function WordMap({ term, groups }: { term: string; groups: MapGroup[] }) {
  const map = layoutWordMap(groups);
  if (map.groups.length === 0) return null;
  const { center } = map;
  return (
    <section aria-label="Bản đồ từ vựng" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <h2 className="text-headline-sm font-extrabold">Bản đồ từ vựng</h2>
      <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="group" aria-label={`Các từ liên quan tới ${term}`} className="mx-auto block w-full max-w-md">
        {map.groups.map((g) => (
          <g key={g.id}>
            {g.nodes.map((n) => <line key={n.term} x1={g.hubX} y1={g.hubY} x2={n.x} y2={n.y} stroke={COLORS[g.id]} strokeWidth="1.5" opacity="0.5" />)}
            <line x1={center.x} y1={center.y} x2={g.hubX} y2={g.hubY} stroke={COLORS[g.id]} strokeWidth="2.5" />
            <circle cx={g.hubX} cy={g.hubY} r="5" fill={COLORS[g.id]} />
            <text x={g.labelX} y={g.labelY} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--on-surface)">{g.shortLabel}</text>
          </g>
        ))}
        <circle cx={center.x} cy={center.y} r="34" fill="var(--primary-container)" stroke="var(--outline)" strokeWidth="2" />
        <text x={center.x} y={center.y} textAnchor="middle" dominantBaseline="central" fontSize={[...term].length > 2 ? 18 : 28} fontWeight="800" fill="var(--on-primary-container)" lang="zh-Hans">{term}</text>
        {map.groups.flatMap((g) => g.nodes).map((n) => (
          <Link key={`${n.groupId}-${n.term}`} href={wordHref(n.term)} aria-label={`${n.term}, ${n.pinyin}${n.meaning ? `, ${n.meaning}` : ""}`}>
            <circle cx={n.x} cy={n.y} r="24" fill="var(--surface-container-lowest)" stroke={COLORS[n.groupId]} strokeWidth="2.5" />
            <text x={n.x} y={n.y} textAnchor="middle" dominantBaseline="central" fontSize={[...n.term].length > 2 ? 13 : 18} fontWeight="700" fill="var(--on-surface)" lang="zh-Hans">{n.term}</text>
          </Link>
        ))}
      </svg>
      <ul className="grid gap-x-space-md gap-y-1 text-body-md sm:grid-cols-2">
        {map.groups.map((g) => (
          <li key={g.id}>
            <p className="font-bold">{g.label}</p>
            <ul>{g.nodes.map((n) => <li key={n.term}><Link href={wordHref(n.term)} className="inline-flex min-h-11 items-center gap-2 hover:underline"><span lang="zh-Hans" className="font-serif text-lg font-bold">{n.term}</span><span className="text-primary">{n.pinyin}</span><span className="text-on-surface-variant">{n.meaning}</span></Link></li>)}</ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
