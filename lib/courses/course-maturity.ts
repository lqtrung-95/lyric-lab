/**
 * Khóa học còn đang phát triển: nội dung đã mở cho học nhưng chưa được rà soát (nghĩa tiếng Việt do AI sinh, nhiều từ chưa có câu thật làm ví dụ).
 * Giao diện hiện nhãn "Đang phát triển" và lời nhắn góp ý. Gỡ khỏi danh sách khi đã rà xong.
 */
const IN_DEVELOPMENT = new Set(["hsk-6"]);

export const isCourseInDevelopment = (slug: string): boolean => IN_DEVELOPMENT.has(slug);
