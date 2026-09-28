/** Khối giữ chỗ khi đang tải, hình dạng gần giống nội dung thật để tránh giật layout (CLS) lúc dữ liệu về. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-xl bg-surface-container-high ${className}`} />;
}
