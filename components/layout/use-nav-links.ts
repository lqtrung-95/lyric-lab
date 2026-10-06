"use client";

import { NAV_LINKS, type NavLink } from "./nav-links";

const PUBLIC = process.env.NEXT_PUBLIC_VIDEO_PUBLIC === "1";
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Các mục điều hướng người dùng được thấy. Mục `previewOnly` (Video, đang thử nghiệm) chỉ hiện ở môi trường phát triển, kể cả với admin, cho
 * tới khi đặt `NEXT_PUBLIC_VIDEO_PUBLIC=1` để mở cho mọi người. Chỉ ẩn lối vào trên menu: trang `/video` vẫn mở được bằng đường dẫn
 * (admin dùng để thử) nhưng danh sách trống cho tới khi có video được duyệt (`status = listed`).
 */
export function useNavLinks(): NavLink[] {
  const showPreview = PUBLIC || !IS_PRODUCTION;
  return NAV_LINKS.filter((l) => !l.previewOnly || showPreview);
}
