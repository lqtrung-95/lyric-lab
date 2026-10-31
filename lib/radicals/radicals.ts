import { RADICALS, type Radical } from "./radicals-core";
import { RICH, type RadicalRich } from "./radicals-rich";

export type TopicId = "nguoi" | "thien" | "dongvat" | "hanhdong" | "nocua" | "dovat" | "kyhieu";
export interface Topic { id: TopicId; title: string; blurb: string; chars: string }

/** Chủ đề để nhóm bộ thủ. Một bộ thuộc chủ đề đầu tiên chứa nó; bộ không có trong danh sách nào rơi vào "Số, màu và ký hiệu". */
export const TOPICS: Topic[] = [
  { id: "nguoi", title: "Con người và cơ thể", blurb: "Người, bộ phận cơ thể, gia đình", chars: "人儿大女子士尸老父己自身面首目口耳舌鼻心手足肉骨血皮毛力又寸欠鬼髟齒牙臣夂夊色" },
  { id: "dongvat", title: "Động vật", blurb: "Thú, chim, cá, côn trùng", chars: "牛犬羊虫豕豸魚鳥隹鹿馬龍龜鼠虍羽角黽飛" },
  { id: "thien", title: "Thiên nhiên và cây cỏ", blurb: "Trời đất, nước lửa, cây trồng", chars: "日月水火土木山石雨風气冫夕谷川巛田禾竹艸米生瓜麥麻豆韭黍黃" },
  { id: "hanhdong", title: "Hành động và di chuyển", blurb: "Đi, nhìn, nói, ăn, đánh", chars: "辶彳廴走止行見言攴戈殳至立入舛癶曰食酉" },
  { id: "nocua", title: "Nhà cửa và địa điểm", blurb: "Mái nhà, cổng, thành, hang", chars: "宀广冂囗匚匸凵厂門戶邑阜里穴高亠" },
  { id: "dovat", title: "Đồ vật và công cụ", blurb: "Dao, cung, xe, thuyền, vải vóc", chars: "刀弓矢矛斤車舟衣巾糸缶皿网瓦鼎鼓斗几工用片爿示貝玉金黹" },
  { id: "kyhieu", title: "Số, màu và ký hiệu", blurb: "Nét cơ bản, con số, màu sắc", chars: "" },
];

export interface RadicalEntry extends Radical { topic: TopicId; rich: RadicalRich | null }

const topicOf = (c: string): TopicId => TOPICS.find((t) => t.chars.includes(c))?.id ?? "kyhieu";

export const ENTRIES: RadicalEntry[] = RADICALS.map((r) => ({ ...r, topic: topicOf(r.char), rich: RICH[r.char] ?? null }));

export const entryByNum = (n: number): RadicalEntry | undefined => ENTRIES[n - 1];
export const entriesOfTopic = (id: TopicId): RadicalEntry[] => ENTRIES.filter((e) => e.topic === id);
export const isTopicId = (s: string): s is TopicId => TOPICS.some((t) => t.id === s);

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").toLowerCase();

/** Tìm theo chữ (kể cả biến thể), pinyin, tên Hán Việt, nghĩa hoặc số thứ tự; không phân biệt dấu. */
export function searchRadicals(q: string, list: readonly RadicalEntry[] = ENTRIES): RadicalEntry[] {
  const k = fold(q.trim());
  if (!k) return [...list];
  return list.filter((e) => e.char.includes(q.trim()) || e.variants.some((v) => v === q.trim()) || String(e.num) === k || [e.pinyin, e.name, e.meaning].some((f) => fold(f).includes(k)));
}
