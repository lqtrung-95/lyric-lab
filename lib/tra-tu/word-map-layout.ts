export interface MapNode { term: string; pinyin: string; meaning: string }
export interface MapGroup {
  id: "compound" | "radical" | "theme";
  label: string;
  /** Nhãn ngắn vẽ trên bản đồ (nhãn đầy đủ nằm ở danh sách bên dưới). */
  shortLabel: string;
  nodes: MapNode[];
}
export interface PlacedNode extends MapNode { x: number; y: number; groupId: MapGroup["id"] }
export interface PlacedGroup { id: MapGroup["id"]; label: string; shortLabel: string; hubX: number; hubY: number; labelX: number; labelY: number; nodes: PlacedNode[] }

export const MAP_WIDTH = 360;
export const MAP_HEIGHT = 400;
const CENTER = { x: MAP_WIDTH / 2, y: 200 };
const NODE_RADIUS = 138;
const HUB_RADIUS = 70;
const SPREAD_DEG = 36;
// Hướng của các nhóm theo số nhóm đang có: một nhóm ở trên; hai nhóm trên-dưới; ba nhóm cách đều 120° (nhãn không đè nhau). Mỗi nhóm có tối đa 4 nút xếp trên một cung.
const DIRECTIONS: Record<number, number[]> = { 1: [-90], 2: [-90, 90], 3: [-90, 30, 150] };

const polar = (deg: number, r: number) => ({ x: Math.round(CENTER.x + r * Math.cos((deg * Math.PI) / 180)), y: Math.round(CENTER.y + r * Math.sin((deg * Math.PI) / 180)) });

/** Tính vị trí các nút của bản đồ từ vựng: từ đang xem ở giữa, mỗi nhóm một hướng, các nút trải đều trên cung quanh hướng đó. Nhóm rỗng bị bỏ. */
export function layoutWordMap(groups: MapGroup[], perGroup = 4): { center: { x: number; y: number }; groups: PlacedGroup[] } {
  const present = groups.filter((g) => g.nodes.length > 0);
  const placed = present.map((g, gi): PlacedGroup => {
    const nodes = g.nodes.slice(0, perGroup);
    const base = DIRECTIONS[present.length][gi];
    const hub = polar(base, HUB_RADIUS);
    const label = polar(base, HUB_RADIUS + 20);
    return {
      id: g.id, label: g.label, shortLabel: g.shortLabel, hubX: hub.x, hubY: hub.y, labelX: label.x, labelY: label.y,
      nodes: nodes.map((n, i) => ({ ...n, groupId: g.id, ...polar(base + (nodes.length === 1 ? 0 : (i / (nodes.length - 1) - 0.5) * 2 * SPREAD_DEG), NODE_RADIUS) })),
    };
  });
  return { center: CENTER, groups: placed };
}
