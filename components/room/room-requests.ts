import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";

export type RequestResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** POST JSON tới API phòng. Chưa có phiên (401) thì tạo phiên ẩn danh rồi thử lại đúng một lần. */
async function post<T>(path: string, body: unknown, retried = false): Promise<RequestResult<T>> {
  try {
    const res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && !retried && (await ensureAnonymousSession())) return post<T>(path, body, true);
    return res.ok ? { ok: true, data: data as T } : { ok: false, error: typeof data?.error === "string" ? data.error : "server_error" };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

/** Tên hiển thị trong phòng lấy từ biệt danh của tài khoản ở phía server, nên không gửi tên lên đây. */
export const createRoomRequest = (videoId: string | null) => post<{ code: string }>("/api/rooms", { videoId });

export const joinRoomRequest = (code: string) => post<{ code: string }>(`/api/rooms/${code}/join`, {});
