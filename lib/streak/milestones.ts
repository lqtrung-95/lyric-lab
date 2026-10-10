/** Cột mốc học tập, tính thuần từ số liệu sẵn có (không có bảng riêng nên hoàn tác dữ liệu cũng tự cập nhật). */
export type MilestoneGroup = "streak" | "words" | "video";

export interface MilestoneInput {
  longest: number;
  learnedWords: number;
  videoLines: number;
}

export interface Milestone {
  id: string;
  group: MilestoneGroup;
  target: number;
  label: string;
  earned: boolean;
  /** Giá trị hiện tại của nhóm (để tính "còn bao nhiêu tới mốc"). */
  value: number;
}

const DEFS: { group: MilestoneGroup; targets: number[]; label: (n: number) => string; unit: string }[] = [
  { group: "streak", targets: [3, 7, 14, 30, 100], label: (n) => `Chuỗi ${n} ngày`, unit: "ngày" },
  { group: "words", targets: [10, 50, 100, 250, 500, 1000], label: (n) => `${n} từ đã ôn`, unit: "từ" },
  { group: "video", targets: [10, 50, 100, 300], label: (n) => `${n} câu học qua video`, unit: "câu" },
];

export function computeMilestones(input: MilestoneInput): Milestone[] {
  const values: Record<MilestoneGroup, number> = { streak: input.longest, words: input.learnedWords, video: input.videoLines };
  return DEFS.flatMap((d) => d.targets.map((target): Milestone => ({
    id: `${d.group}-${target}`, group: d.group, target, label: d.label(target), earned: values[d.group] >= target, value: values[d.group],
  })));
}

/** Mốc chưa đạt gần nhất của từng nhóm, kèm số còn thiếu. */
export function nextMilestones(milestones: Milestone[]): { milestone: Milestone; remaining: number; unit: string }[] {
  return DEFS.flatMap((d) => {
    const next = milestones.find((m) => m.group === d.group && !m.earned);
    return next ? [{ milestone: next, remaining: next.target - next.value, unit: d.unit }] : [];
  });
}

/**
 * So các mốc đã đạt với danh sách đã báo (lưu trong trình duyệt). Lần đầu (`seen` là null) chỉ ghi nhận, không báo gì: người dùng cũ có sẵn nhiều mốc
 * nên báo hết một lượt sẽ tràn màn hình.
 */
export function diffNewMilestones(milestones: Milestone[], seen: string[] | null): { fresh: Milestone[]; seen: string[] } {
  const earned = milestones.filter((m) => m.earned);
  const all = earned.map((m) => m.id);
  if (seen === null) return { fresh: [], seen: all };
  const known = new Set(seen);
  return { fresh: earned.filter((m) => !known.has(m.id)), seen: all };
}
