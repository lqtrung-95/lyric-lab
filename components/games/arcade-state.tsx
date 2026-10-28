import type { PoolStatus } from "@/components/practice/use-practice-pool";

/** Trạng thái tải / lỗi / thiếu từ chung của các game; trả null khi đã sẵn sàng chơi. */
export function arcadeGate(status: PoolStatus, enough: boolean, need: string): React.ReactNode {
  if (status === "loading") return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải từ của bạn…</p>;
  if (status === "error") return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được từ. Kiểm tra kết nối rồi tải lại trang nhé.</p>;
  if (!enough) return <p role="status" className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-md text-on-surface-variant">{need}</p>;
  return null;
}
