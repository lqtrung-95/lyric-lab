export type UsageKind = "analyze" | "explain" | "tts";

// Hạn mức trong 24 giờ theo tài khoản. Phân tích bài mới theo PRD §7; giải nghĩa từ bằng LLM tốn ít hơn nên cho nhiều hơn.
const LIMITS: Record<UsageKind, { anonymous: number; member: number }> = {
  analyze: { anonymous: 10, member: 30 },
  explain: { anonymous: 60, member: 200 },
  // Chỉ tính lần tổng hợp giọng MỚI (file đã lưu phát lại không tốn hạn mức); gói Azure miễn phí có trần ký tự hàng tháng.
  tts: { anonymous: 80, member: 250 },
};

export const USAGE_WINDOW_HOURS = 24;

export function usageLimit(kind: UsageKind, isAnonymous: boolean): number {
  return isAnonymous ? LIMITS[kind].anonymous : LIMITS[kind].member;
}
