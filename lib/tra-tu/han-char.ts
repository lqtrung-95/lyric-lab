/** Đúng MỘT chữ Hán (một code point): chặn mọi chuỗi có thể thoát khỏi thư mục dữ liệu như "../x". */
export const isSingleHan = (s: string): boolean => [...s].length === 1 && /^\p{Script=Han}$/u.test(s);
