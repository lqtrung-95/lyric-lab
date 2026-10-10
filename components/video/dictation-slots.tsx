/**
 * Cho người học biết câu cần điền bao nhiêu chữ Hán, kèm hàng ô trống (mỗi ô một chữ). Hữu ích khi ngắt câu của video chưa chuẩn (có chữ nghe được nhưng không
 * thuộc câu này): đếm số chữ biết chắc mình đã đủ hay còn thiếu. Không lộ chữ nào, chỉ lộ độ dài. Cố ý không nhóm theo từ: cách tách từ của máy
 * (ví dụ 大家 + 好) không trùng cách người học nghĩ và chỉ gây rối.
 */
export function DictationSlots({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-label-md text-on-surface-variant">Cần điền <strong className="text-on-surface">{count} chữ Hán</strong></p>
      <div aria-hidden="true" className="flex flex-wrap gap-1.5">
        {Array.from({ length: count }).map((_, k) => <span key={k} className="h-7 w-7 rounded-md border-b-2 border-outline bg-surface-container-high" />)}
      </div>
    </div>
  );
}
