"use client";

import { SelectField } from "@/components/ui/select-field";
import { PLAYER_SIZES, type PlayerSize } from "@/lib/user-state/listen-prefs";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";

const LABELS: Record<PlayerSize, string> = { large: "Lớn (đầy khung)", medium: "Vừa", small: "Nhỏ" };

/**
 * Cỡ khung video ở màn Nghe, nhớ trong trình duyệt. Chỉ có tác dụng từ màn hình rộng (điện thoại đã ở cỡ nhỏ nhất cho phép).
 * Không có tùy chọn ẩn video: player nhúng của YouTube phải còn nhìn thấy và không nhỏ hơn mức tối thiểu của họ.
 */
export function ListenSection() {
  const { prefs, update } = useListenPrefs();
  return (
    <section aria-labelledby="listen-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="listen-heading" className="font-serif text-headline-md text-on-surface">Màn Nghe</h2>
      <label className="mt-space-sm inline-flex items-center gap-2 text-label-md text-on-surface-variant">
        <span>Cỡ video</span>
        <SelectField value={prefs.playerSize} onChange={(e) => update({ playerSize: e.target.value as PlayerSize })}>
          {PLAYER_SIZES.map((size) => <option key={size} value={size}>{LABELS[size]}</option>)}
        </SelectField>
      </label>
      <p className="mt-1 text-label-md text-on-surface-variant">Chọn cỡ nhỏ để có thêm chỗ cho lời bài hát. Chỉ áp dụng trên màn hình rộng; trên điện thoại video luôn ở cỡ nhỏ nhất.</p>
    </section>
  );
}
