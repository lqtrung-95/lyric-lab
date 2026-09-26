import { LogoMark } from "@/components/brand/logo-mark";

const bar = "animate-pulse rounded-full bg-surface-container-high motion-reduce:animate-none";

/** Khung chờ cho các trang bài học (xem trước, nghe, tổng kết) trong lúc server đọc dữ liệu bài hát. */
export default function LearnLoading() {
  return (
    <div role="status" aria-label="Đang tải bài hát">
      <div className="fixed inset-x-0 top-0 z-50 flex h-16 items-center bg-surface/90 px-gutter md:px-6 lg:px-12">
        <LogoMark size={32} />
      </div>
      <main className="mx-auto max-w-7xl px-gutter pt-24 md:px-6 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_1.4fr]">
          <div className="aspect-video animate-pulse rounded-2xl bg-surface-container-high motion-reduce:animate-none" />
          <div className="flex flex-col gap-4 pt-2">
            <div className={`${bar} h-4 w-40`} />
            <div className={`${bar} h-10 w-2/3`} />
            <div className={`${bar} h-4 w-full`} />
            <div className={`${bar} h-4 w-5/6`} />
            <div className={`${bar} mt-4 h-12 w-56`} />
          </div>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-xl bg-surface-container-low motion-reduce:animate-none" />)}
        </div>
      </main>
      <span className="sr-only">Đang tải bài hát…</span>
    </div>
  );
}
