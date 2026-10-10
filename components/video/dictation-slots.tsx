/**
 * Cho người học biết câu cần điền bao nhiêu chữ Hán và bao nhiêu từ, kèm hàng ô trống nhóm theo từ (mỗi ô một chữ). Hữu ích khi ngắt câu của video chưa chuẩn
 * (có chữ nghe được nhưng không thuộc câu này): đếm số chữ biết chắc mình đã đủ hay còn thiếu. Không lộ chữ nào, chỉ lộ độ dài.
 */
export function DictationSlots({ slots }: { slots: number[] }) {
  if (slots.length === 0) return null;
  const chars = slots.reduce((a, b) => a + b, 0);
  return (
    <div className="space-y-1.5">
      <p className="text-label-md text-on-surface-variant">
        Cần điền <strong className="text-on-surface">{chars} chữ Hán</strong>{slots.length > 1 && <> · {slots.length} từ</>}
      </p>
      <ul aria-hidden="true" className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {slots.map((n, i) => (
          <li key={i} className="flex gap-1">
            {Array.from({ length: n }).map((_, k) => <span key={k} className="h-6 w-6 rounded-md border-b-2 border-outline bg-surface-container-high" />)}
          </li>
        ))}
      </ul>
    </div>
  );
}
