import Image from "next/image";

// Bảng màu cố định (không phụ thuộc theme) để chữ trắng luôn đủ tương phản trên nền.
const PALETTE = ["#c2410c", "#0f766e", "#7c3aed", "#be123c", "#0369a1", "#4d7c0f"];

function colorFor(seed: string): string {
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface AvatarCircleProps {
  nickname: string;
  avatarUrl?: string | null;
  size: number;
}

/** Ảnh đại diện tròn; chưa có ảnh thì hiện chữ cái đầu biệt danh trên nền màu cố định theo biệt danh (đồng nhất giữa các lượt tải). */
export function AvatarCircle({ nickname, avatarUrl, size }: AvatarCircleProps) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl} alt="" width={size} height={size} unoptimized
        className="shrink-0 rounded-full object-cover ring-2 ring-surface-container-lowest"
        style={{ width: size, height: size }}
      />
    );
  }
  const initial = [...nickname.trim()][0]?.toUpperCase() ?? "?";
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-serif font-semibold text-white ring-2 ring-surface-container-lowest"
      style={{ width: size, height: size, backgroundColor: colorFor(nickname), fontSize: size * 0.42 }}
    >
      {initial}
    </span>
  );
}
