// Tài khoản được coi là quản trị (ẩn/xóa bài ở Khám phá cho mọi người, không chỉ khỏi danh sách của riêng mình).
// Đặt qua biến môi trường, không hardcode trong code.
const list = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function isAdminAccount(email: string | null): boolean {
  return email !== null && list.includes(email.toLowerCase());
}
