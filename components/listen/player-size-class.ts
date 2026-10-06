import type { PlayerSize } from "@/lib/user-state/listen-prefs";

// Cỡ khung video từ md trở lên (điện thoại luôn là cỡ nhỏ nhất cho phép). "Nhỏ" = 356px rộng, tức 200px cao ở tỉ lệ 16:9, là
// mức nhỏ nhất ta cho phép vì player nhúng của YouTube không được nhỏ hơn khoảng 200x200 (xem docs/system-architecture.md).
export const PLAYER_SIZE_CLASS: Record<PlayerSize, string> = { large: "", medium: "md:max-w-[560px]", small: "md:max-w-[356px]" };
