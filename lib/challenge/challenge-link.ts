/**
 * Link thách đấu: mang theo hạt giống bộ câu, điểm của người thách và tên hiển thị. Không lưu gì ở máy chủ, nên điểm trong link chỉ là lời thách
 * giữa bạn bè (ai sửa link thì chỉ tự lừa mình). Dữ liệu đọc từ link luôn được kiểm tra và cắt gọn trước khi hiển thị.
 */
export interface Challenge { seed: string; score: number; total: number; from: string }

const SEED = /^[a-z0-9]{4,12}$/;
const FROM_MAX = 16;

type Params = Pick<URLSearchParams, "get">;

/** Đọc lời thách từ tham số link; thiếu hoặc sai dạng thì null (người chơi chơi bình thường). */
export function parseChallenge(params: Params, maxTotal = 20): Challenge | null {
  const seed = params.get("seed") ?? "";
  const total = Number(params.get("n") ?? "");
  const score = Number(params.get("score") ?? "");
  if (!SEED.test(seed) || !Number.isInteger(total) || total < 1 || total > maxTotal || !Number.isInteger(score) || score < 0 || score > total) return null;
  const from = [...(params.get("from") ?? "").replace(/[\u0000-\u001f<>]/g, "").trim()].slice(0, FROM_MAX).join("") || "Một người bạn";
  return { seed, score, total, from };
}

/** Link thách: `origin + path` kèm tham số. `from` rỗng thì bỏ qua. */
export function buildChallengeUrl(base: string, c: Challenge): string {
  const url = new URL(base);
  url.search = "";
  url.searchParams.set("seed", c.seed);
  url.searchParams.set("n", String(c.total));
  url.searchParams.set("score", String(c.score));
  if (c.from) url.searchParams.set("from", c.from);
  return url.toString();
}

export type ChallengeVerdict = "beat" | "tie" | "behind";
export const challengeVerdict = (mine: number, theirs: number): ChallengeVerdict => (mine > theirs ? "beat" : mine === theirs ? "tie" : "behind");
