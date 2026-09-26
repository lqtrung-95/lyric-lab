/** Vòng xoay nhỏ báo đang chờ. Trang trí (aria-hidden): trạng thái chờ được báo bằng aria-busy/văn bản ở nơi dùng. */
export function Spinner({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, animation: "spin-slow 0.8s linear infinite" }}
      className={`inline-block rounded-full border-2 border-current border-t-transparent motion-reduce:[animation-duration:2.5s] ${className}`}
    />
  );
}
