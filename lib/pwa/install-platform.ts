// Nhận diện thiết bị cho hướng dẫn cài app (PWA) lên màn hình chính. Chỉ dùng chuỗi trình duyệt (user agent) nên chỉ là gợi ý chọn tab mặc định: người dùng luôn đổi tay được.
export type InstallPlatform = "ios" | "android" | "other";

/** iPhone/iPad/iPod → "ios"; Android → "android"; còn lại (máy tính...) → "other". iPadOS 13+ tự xưng là Mac nhưng có màn hình cảm ứng nhiều điểm chạm. */
export function detectInstallPlatform(userAgent: string, platform = "", maxTouchPoints = 0): InstallPlatform {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return "ios";
  if (platform === "MacIntel" && maxTouchPoints > 1) return "ios";
  if (/Android/i.test(userAgent)) return "android";
  return "other";
}

/**
 * Đang mở trong trình duyệt nhúng của một app khác (Zalo, Facebook, Messenger, Instagram, TikTok, Line): các trình duyệt này không có chức năng thêm vào màn hình chính,
 * phải mở bằng Safari/Chrome trước. Người Việt hay mở link từ Zalo/Facebook nên đáng báo riêng.
 */
export function isInAppBrowser(userAgent: string): boolean {
  return /FBAN|FBAV|FB_IAB|Instagram|Zalo|Messenger|musical_ly|TikTok|BytedanceWebview|\bLine\//i.test(userAgent);
}

/** Đang chạy như app đã cài (mở từ biểu tượng ở màn hình chính) chứ không phải trong thẻ trình duyệt. */
export function isStandaloneDisplay(): boolean {
  try {
    return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}
