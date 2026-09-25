import { timingSafeEqual } from "node:crypto";

const MIN_SECRET_LENGTH = 16;

/**
 * Route thăm dò chỉ bật khi đã đặt CAPTION_PROBE_SECRET (≥ 16 ký tự) và request gửi đúng giá trị đó trong header.
 * So sánh thời gian không đổi để không lộ độ dài/nội dung qua thời gian phản hồi.
 */
export function isProbeAuthorized(secret: string | undefined, provided: string | null): boolean {
  if (!secret || secret.length < MIN_SECRET_LENGTH || !provided) return false;
  const a = Buffer.from(secret);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}
