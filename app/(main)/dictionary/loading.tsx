import { Spinner } from "@/components/ui/spinner";

/** Khung chờ khi tra từ: hiện ngay lúc bấm Tra (kết quả tra chạy ở server nên cần một lúc). */
export default function DictionaryLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-space-md" aria-busy="true">
      <header className="space-y-1">
        <h1 className="text-headline-lg font-extrabold">Tra từ</h1>
        <p role="status" className="flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tra từ điển…</p>
      </header>
      <div aria-hidden="true" className="card-ink h-16 animate-pulse bg-surface-container-lowest" />
      <ul aria-hidden="true" className="card-ink divide-y divide-outline-variant bg-surface-container-lowest p-1">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex animate-pulse items-center gap-3 p-space-sm">
            <span className="h-10 w-16 rounded-lg bg-surface-container" />
            <span className="flex-1 space-y-2"><span className="block h-4 w-1/3 rounded bg-surface-container" /><span className="block h-3 w-2/3 rounded bg-surface-container" /></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
