import { DIFFICULTY_LABEL, type StoryDifficulty } from "@/lib/explore/story/story-types";

/** Màu theo độ khó: Dễ xanh lá, Vừa vàng, Khó đỏ (cố định, đọc được ở cả hai chế độ sáng/tối). */
const STYLE: Record<StoryDifficulty, { background: string; color: string }> = {
  easy: { background: "#bcf1a9", color: "#1f4a17" },
  medium: { background: "#ffe08a", color: "#5a3b00" },
  hard: { background: "#f5a099", color: "#5a1209" },
};

export function DifficultyBadge({ level, prefix = "" }: { level: StoryDifficulty; prefix?: string }) {
  return (
    <span className="inline-block rounded-full border-2 border-ink px-2.5 py-0.5 text-label-md font-extrabold" style={STYLE[level]}>
      {prefix}{DIFFICULTY_LABEL[level]}
    </span>
  );
}
