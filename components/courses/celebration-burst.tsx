const PIECES = ["🎉", "⭐", "✨", "🎊", "⭐", "✨", "🎉", "🎊"];

/**
 * Hiệu ứng ăn mừng khi qua chặng: vài biểu tượng bay lên rồi mờ dần. Chỉ chạy khi người dùng không tắt chuyển động (motion-safe); trang trí thuần túy nên ẩn với trình đọc màn hình.
 */
export function CelebrationBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex justify-around overflow-hidden">
      {PIECES.map((p, i) => (
        <span key={i} className="celebrate-piece text-2xl motion-reduce:hidden" style={{ animationDelay: `${i * 90}ms` }}>{p}</span>
      ))}
    </div>
  );
}
