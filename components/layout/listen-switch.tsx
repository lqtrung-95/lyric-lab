import Link from "next/link";

/** Công tắc "Bài hát | Video" ở đầu hai trang của khu Nghe (thư viện bài hát và danh sách video), vì mục Nghe trên thanh điều hướng chỉ có một cửa vào. */
export function ListenSwitch({ current }: { current: "songs" | "videos" }) {
  const item = (active: boolean) => `inline-flex min-h-11 items-center rounded-full px-5 text-label-md font-bold ${active ? "border-2 border-ink bg-primary-container text-on-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "border-2 border-transparent text-on-surface-variant hover:bg-surface-container-high"}`;
  return (
    <nav aria-label="Loại nội dung để nghe" className="mb-space-md flex w-fit gap-1 rounded-full bg-surface-container p-1">
      <Link href="/library" aria-current={current === "songs" ? "page" : undefined} className={item(current === "songs")}>Bài hát</Link>
      <Link href="/video" aria-current={current === "videos" ? "page" : undefined} className={item(current === "videos")}>Video</Link>
    </nav>
  );
}
