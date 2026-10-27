import type { CurrentUser } from "@/lib/auth/current-user";

export interface GrammarQuotaDeps {
  /** Trần chung cho cả máy chủ (mọi người dùng). */
  consumeGlobal(): boolean;
  /** Hạn mức theo IP, dùng cho khách chưa có phiên (chưa đăng nhập, chưa vào app). */
  consumeIp(ip: string): boolean;
  /** Hạn mức theo tài khoản (đếm trong Postgres, đúng cả khi chạy nhiều instance). */
  consumeUser(user: CurrentUser): boolean | Promise<boolean>;
}

/**
 * Quyết định một lượt kiểm tra ngữ pháp bằng AI có được tính và gọi model hay không: có tài khoản (kể cả khách ẩn danh trong app) thì tính theo tài khoản,
 * còn khách chưa có phiên thì tính theo IP; trần chung kiểm tra TRƯỚC để lượt bị từ chối vì trần chung không bị trừ vào hạn mức của người dùng.
 */
export async function allowGrammarCall(user: CurrentUser | null, ip: string, deps: GrammarQuotaDeps): Promise<boolean> {
  if (!deps.consumeGlobal()) return false;
  return user ? await deps.consumeUser(user) : deps.consumeIp(ip);
}
