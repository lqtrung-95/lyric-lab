"use client";

import { SelectField } from "@/components/ui/select-field";
import { PLAYER_SIZES, type PlayerSize } from "@/lib/user-state/listen-prefs";
import { useListenPrefs } from "@/lib/user-state/use-listen-prefs";
import { SettingRow } from "./settings-card";

const LABELS: Record<PlayerSize, string> = { large: "Lớn (đầy khung)", medium: "Vừa", small: "Nhỏ" };

/**
 * Dòng cài đặt cỡ khung video ở màn Nghe, nhớ trong trình duyệt. Chỉ có tác dụng từ màn hình rộng (điện thoại đã ở cỡ nhỏ nhất cho phép).
 * Không có tùy chọn ẩn video: player nhúng của YouTube phải còn nhìn thấy và không nhỏ hơn mức tối thiểu của họ.
 */
export function ListenRows() {
  const { prefs, update } = useListenPrefs();
  return (
    <SettingRow label="Cỡ video ở màn Nghe" hint="Mặc định là vừa. Cỡ nhỏ chừa thêm chỗ cho lời bài hát. Chỉ áp dụng trên màn hình rộng; điện thoại luôn ở cỡ nhỏ nhất.">
      <SelectField aria-label="Cỡ video ở màn Nghe" value={prefs.playerSize} onChange={(e) => update({ playerSize: e.target.value as PlayerSize })}>
        {PLAYER_SIZES.map((size) => <option key={size} value={size}>{LABELS[size]}</option>)}
      </SelectField>
    </SettingRow>
  );
}
