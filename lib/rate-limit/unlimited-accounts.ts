// Tài khoản không bị hạn mức phân tích/giải nghĩa/TTS mỗi ngày. Dùng khi chủ dự án tự test app trên production
// mà không muốn đụng trần dành cho người dùng thường. Đặt qua biến môi trường, không hardcode trong code.
const list = (process.env.UNLIMITED_USAGE_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isUnlimitedAccount(email: string | null): boolean {
  return email !== null && list.includes(email.toLowerCase());
}
