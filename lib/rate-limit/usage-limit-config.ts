export type UsageKind = "analyze" | "explain";

// Hạn mức trong 24 giờ theo tài khoản. Phân tích bài mới theo PRD §7; giải nghĩa từ bằng LLM tốn ít hơn nên cho nhiều hơn.
const LIMITS: Record<UsageKind, { anonymous: number; member: number }> = {
  analyze: { anonymous: 10, member: 30 },
  explain: { anonymous: 60, member: 200 },
};

export const USAGE_WINDOW_HOURS = 24;

export function usageLimit(kind: UsageKind, isAnonymous: boolean): number {
  return isAnonymous ? LIMITS[kind].anonymous : LIMITS[kind].member;
}
