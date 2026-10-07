import { SITE_URL } from "@/lib/seo/site-url";

/** Link hủy nhận một chạm của một người (trang xác nhận, có nút bấm; API POST cùng đường dẫn phục vụ "hủy một chạm" của ứng dụng thư). */
export const unsubscribeUrl = (token: string) => `${SITE_URL}/unsubscribe/${token}`;
/** Địa chỉ POST cho header List-Unsubscribe-Post. */
export const oneClickUnsubscribeUrl = (token: string) => `${SITE_URL}/api/email/unsubscribe?token=${token}`;
export { SITE_URL };
