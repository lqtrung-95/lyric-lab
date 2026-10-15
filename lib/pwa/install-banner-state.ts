import type { InstallPlatform } from "./install-platform";

/** Sau khi người dùng bấm "Để sau", ẩn biểu ngữ mời cài app chừng này ngày (không làm phiền mãi nhưng cũng không biến mất vĩnh viễn). */
export const INSTALL_BANNER_SNOOZE_DAYS = 14;

export interface InstallBannerInput {
  platform: InstallPlatform;
  /** Đã chạy như app cài (mở từ màn hình chính). */
  standalone: boolean;
  /** Đã làm xong thiết lập đầu tiên (chọn level): người mới làm quen trước, đừng chất thêm một lời mời nữa. */
  onboarded: boolean;
  /** Thời điểm (ms) bấm "Để sau" lần gần nhất; null nếu chưa. */
  dismissedAt: number | null;
  now: number;
}

/**
 * Có hiện biểu ngữ mời cài app ở trang chủ không: chỉ trên điện thoại (iPhone/iPad/Android) chưa cài, đã qua thiết lập đầu tiên, và không đang trong thời gian "Để sau".
 * Máy tính không có biểu ngữ này vì hướng dẫn nói về màn hình chính của điện thoại.
 */
export function shouldShowInstallBanner({ platform, standalone, onboarded, dismissedAt, now }: InstallBannerInput): boolean {
  if (platform === "other" || standalone || !onboarded) return false;
  if (dismissedAt !== null && now - dismissedAt < INSTALL_BANNER_SNOOZE_DAYS * 24 * 3600 * 1000) return false;
  return true;
}
