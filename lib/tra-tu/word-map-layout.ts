export interface MapNode { term: string; pinyin: string; meaning: string }
export interface MapGroup {
  id: "compound" | "radical" | "theme";
  label: string;
  /** Nhãn ngắn vẽ trên bản đồ (nhãn đầy đủ nằm ở danh sách bên dưới). */
  shortLabel: string;
  nodes: MapNode[];
}
export interface PlacedNode extends MapNode { x: number; y: number; w: number; h: number; fontSize: number; groupId: MapGroup["id"] }
export interface PlacedGroup { id: MapGroup["id"]; label: string; shortLabel: string; labelX: number; labelY: number; nodes: PlacedNode[] }

export const MAP_WIDTH = 360;
export const NODE_HEIGHT = 44;
const CENTER = { x: MAP_WIDTH / 2, y: 140 };
const ROW_GAP = 8;
const COLUMN_PITCH = 52;
const MAX_ROW_WIDTH = MAP_WIDTH - 20;
const COLUMN_WIDTH = 160;

/** Độ rộng nút theo số chữ: nút hình viên thuốc vừa khít chữ nên từ dài (đến 8 chữ) không tràn ra ngoài như nút tròn. */
export function nodeSize(term: string): { w: number; fontSize: number } {
  const n = [...term].length;
  const fontSize = n > 6 ? 12 : n > 3 ? 15 : 18;
  return { w: Math.min(COLUMN_WIDTH, Math.max(48, Math.round(n * fontSize * 1.05 + 18))), fontSize };
}

const place = (n: MapNode, groupId: MapGroup["id"], x: number, y: number): PlacedNode => ({ ...n, groupId, x, y, h: NODE_HEIGHT, ...nodeSize(n.term) });

/** Một hàng ngang các nút, canh giữa tại `cx`; bỏ bớt nút cuối khi vượt bề ngang khung. */
function row(nodes: MapNode[], groupId: MapGroup["id"], cx: number, y: number): PlacedNode[] {
  const kept: MapNode[] = [];
  let width = -ROW_GAP;
  for (const n of nodes) {
    const next = width + ROW_GAP + nodeSize(n.term).w;
    if (next > MAX_ROW_WIDTH) break;
    kept.push(n); width = next;
  }
  let x = cx - width / 2;
  return kept.map((n) => { const w = nodeSize(n.term).w; const p = place(n, groupId, x + w / 2, y); x += w + ROW_GAP; return p; });
}

const column = (nodes: MapNode[], groupId: MapGroup["id"], cx: number, y0: number): PlacedNode[] => nodes.map((n, i) => place(n, groupId, cx, y0 + i * COLUMN_PITCH));

/**
 * Vị trí các nút của bản đồ từ vựng: từ đang xem ở giữa; nhóm đầu là một hàng ngang phía trên; nhóm thứ hai nằm ở cột trái (hoặc hàng phía dưới khi chỉ có hai nhóm); nhóm thứ ba ở cột phải.
 * Mỗi nhóm có nhãn đặt phía trên cụm nên không đè lên nút. Nhóm rỗng bị bỏ; mỗi nhóm tối đa `perGroup` nút.
 */
export function layoutWordMap(groups: MapGroup[], perGroup = 4): { center: { x: number; y: number }; width: number; height: number; groups: PlacedGroup[] } {
  const present = groups.filter((g) => g.nodes.length > 0).map((g) => ({ ...g, nodes: g.nodes.slice(0, perGroup) }));
  const topY = 56;
  const lowerLabelY = CENTER.y + 90;
  const lowerY = lowerLabelY + 40;
  const placed: PlacedGroup[] = present.map((g, i) => {
    if (i === 0) return { id: g.id, label: g.label, shortLabel: g.shortLabel, labelX: CENTER.x, labelY: topY - 34, nodes: row(g.nodes, g.id, CENTER.x, topY) };
    if (present.length === 2) return { id: g.id, label: g.label, shortLabel: g.shortLabel, labelX: CENTER.x, labelY: lowerLabelY, nodes: row(g.nodes, g.id, CENTER.x, lowerY) };
    const cx = i === 1 ? MAP_WIDTH * 0.26 : MAP_WIDTH * 0.74;
    return { id: g.id, label: g.label, shortLabel: g.shortLabel, labelX: cx, labelY: lowerLabelY, nodes: column(g.nodes, g.id, cx, lowerY) };
  });
  const bottom = Math.max(CENTER.y + 40, ...placed.flatMap((g) => g.nodes.map((n) => n.y + n.h / 2)));
  return { center: CENTER, width: MAP_WIDTH, height: bottom + 14, groups: placed };
}
