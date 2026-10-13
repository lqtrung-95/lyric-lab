/** Tin nhắn như người dùng thấy. `isAdmin` do server đặt lúc gửi (không tin dữ liệu từ client). */
export interface ChatMessage {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  kind: "chat" | "announcement";
  body: string;
  createdAt: string;
}

/** Trạng thái nhẹ để hiện chấm "có tin mới" trên thanh trên và banner thông báo mới nhất. */
export interface ChatStatus {
  latestId: number;
  announcement: { id: number; nickname: string; body: string; createdAt: string } | null;
}
