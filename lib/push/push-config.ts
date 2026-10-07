/** Khóa VAPID công khai (nhúng vào client lúc build). Thiếu thì tính năng nhắc học tự ẩn. */
export const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Phía server: đủ khóa để gửi thông báo đẩy. */
export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY);
}
