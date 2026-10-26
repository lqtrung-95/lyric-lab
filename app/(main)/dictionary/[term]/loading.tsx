import { Spinner } from "@/components/ui/spinner";

/** Khung chờ trang một từ: hiện ngay khi chọn gợi ý hoặc kết quả, trong lúc server dựng trang từ. */
export default function WordLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-space-md" aria-busy="true">
      <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang mở từ…</p>
      <div aria-hidden="true" className="card-ink animate-pulse space-y-3 bg-surface-container-lowest p-space-md">
        <span className="block h-16 w-40 rounded-lg bg-surface-container" />
        <span className="block h-4 w-1/2 rounded bg-surface-container" />
        <span className="block h-4 w-2/3 rounded bg-surface-container" />
      </div>
      <div aria-hidden="true" className="card-ink h-32 animate-pulse bg-surface-container-lowest" />
    </div>
  );
}
