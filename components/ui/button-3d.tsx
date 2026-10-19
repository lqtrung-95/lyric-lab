import type { ButtonHTMLAttributes } from "react";

export type Button3dVariant = "primary" | "secondary" | "tertiary" | "neutral" | "bright";
const VARIANT_CLASS: Record<Button3dVariant, string> = {
  primary: "btn-3d-primary",
  secondary: "btn-3d-secondary",
  tertiary: "btn-3d-tertiary",
  neutral: "btn-3d-neutral",
  bright: "btn-3d-bright",
};

/**
 * Nút 3D dày của thiết kế mới (lớp `.btn-3d` trong globals.css): viền mực, "đáy" nổi, nhấn xuống 4px. Vùng bấm ≥ 44 px. Màu chữ mỗi biến thể đã kiểm tra đạt AA.
 * `primary` (cam đậm, chữ trắng) cho hành động chính; `bright` (cam sáng, chữ nâu) cho nút thưởng/nổi bật; `secondary` xanh rêu (đúng/hoàn thành); `tertiary` xanh dương (âm thanh/phát âm).
 */
export function Button3d({ variant = "primary", className = "", type = "button", ...rest }: { variant?: Button3dVariant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`btn-3d ${VARIANT_CLASS[variant]} ${className}`} {...rest} />;
}
