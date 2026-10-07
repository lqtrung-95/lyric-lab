/** Khóa VAPID công khai (nhúng vào client lúc build). Thiếu thì tính năng nhắc học tự ẩn. */
// `.trim()`: khóa dán vào Vercel hay dính dấu cách/xuống dòng ở cuối, làm bước giải mã khóa của trình duyệt lỗi.
export const VAPID_PUBLIC_KEY = (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "").trim();

/** Phía server: đủ khóa để gửi thông báo đẩy. */
export function isPushConfigured(): boolean {
  return Boolean(VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY?.trim());
}
