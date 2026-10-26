import type { StoryProgress } from "../story/story-types";

/** Chơi chung một vụ án: hai người, vai `a` (người tạo phòng) và `b` (người vào bằng liên kết). */
export type CoopRole = "a" | "b";
export const parseRole = (v: unknown): CoopRole => (v === "a" ? "a" : "b");
export const otherRole = (r: CoopRole): CoopRole => (r === "a" ? "b" : "a");
export const ROLE_LABEL: Record<CoopRole, string> = { a: "Thám tử A", b: "Thám tử B" };

/** Mã phòng: 6 ký tự, bỏ các chữ dễ nhầm (0/O, 1/I). */
export const COOP_CODE = /^[A-HJ-NP-Z2-9]{6}$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newCoopCode(rng: () => number = Math.random): string {
  return Array.from({ length: 6 }, () => ALPHABET[Math.floor(rng() * ALPHABET.length)]).join("");
}

/** Mỗi người phụ trách một nửa số cảnh của vụ án: cảnh thứ chẵn theo thứ tự vụ án là của A, lẻ là của B. */
export function sceneOwner(route: readonly string[], sceneId: string): CoopRole {
  const i = route.indexOf(sceneId);
  return i % 2 === 0 ? "a" : "b";
}

/** Chỗ lưu tiến độ riêng cho một người trong một phòng (hai tab cùng máy không dẫm lên nhau, và không đụng tiến độ chơi một mình). */
export const coopStorageId = (caseId: string, code: string, role: CoopRole): string => `${caseId}@coop-${code}-${role}`;

/** Cờ/manh mối có ở bản nhận được mà bản ở máy chưa có. */
export function unseenShared(local: Pick<StoryProgress, "flags" | "clues">, incoming: Pick<StoryProgress, "flags" | "clues">): { flags: string[]; clues: string[] } {
  const f = new Set(local.flags);
  const c = new Set(local.clues);
  return { flags: incoming.flags.filter((x) => !f.has(x)), clues: incoming.clues.filter((x) => !c.has(x)) };
}

/** Hợp tiến độ của đồng đội vào bản của mình (chỉ thêm cờ và manh mối). Không có gì mới thì trả đúng bản cũ (để không kích hoạt gửi lại). */
export function mergeShared(local: StoryProgress, incoming: Pick<StoryProgress, "flags" | "clues">): StoryProgress {
  const add = unseenShared(local, incoming);
  if (!add.flags.length && !add.clues.length) return local;
  return { ...local, flags: [...local.flags, ...add.flags], clues: [...local.clues, ...add.clues] };
}

/** Câu nói nhanh bằng tiếng Trung để hai người phối hợp (đồng thời là câu để học). */
export const COOP_PHRASES: { zh: string; vi: string }[] = [
  { zh: "你在哪儿?", vi: "Bạn đang ở đâu?" },
  { zh: "我找到线索了!", vi: "Tôi tìm được manh mối rồi!" },
  { zh: "你看这个。", vi: "Bạn xem cái này." },
  { zh: "我们分开找吧。", vi: "Mình chia ra tìm nhé." },
  { zh: "你觉得是谁?", vi: "Bạn nghĩ là ai?" },
  { zh: "我不太明白。", vi: "Tôi chưa hiểu lắm." },
  { zh: "我知道是谁了!", vi: "Tôi biết là ai rồi!" },
  { zh: "我们一起去吧。", vi: "Mình cùng đi nhé." },
];

/** Tin nhận được qua kênh: chỉ chấp nhận câu nói nhanh có sẵn (chống chữ lạ từ người ngoài). */
export function validPhrase(text: unknown): string | null {
  return typeof text === "string" && COOP_PHRASES.some((p) => p.zh === text) ? text : null;
}

/** Đọc liên kết mời (hoặc đường dẫn) dạng `/explore/coop/<mã>/<vụ án>/<cảnh>`; không đúng dạng thì null. */
export function parseCoopLink(text: string): { code: string; caseId: string; sceneId: string } | null {
  const m = text.trim().match(/\/explore\/coop\/([A-Za-z0-9]{6})\/([a-z0-9-]{1,40})\/([a-z0-9-]{1,40})/);
  if (!m) return null;
  const code = m[1].toUpperCase();
  return COOP_CODE.test(code) ? { code, caseId: m[2], sceneId: m[3] } : null;
}
