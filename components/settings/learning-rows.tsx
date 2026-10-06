"use client";

import { useEffect, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { LevelSelect } from "@/components/preview/level-select";
import { DEFAULT_PROFILE, NEW_CARDS_OPTIONS, fetchProfile, saveProfile } from "@/lib/user-data/profile-repo";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";
import { SettingRow } from "./settings-card";

/** Hai dòng cài đặt học: level HSK và số thẻ mới mỗi ngày (mặc định 15). */
export function LearningRows() {
  const [perDay, setPerDay] = useState<number>(DEFAULT_PROFILE.newCardsPerDay);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => setPerDay(p.newCardsPerDay), () => {});
  }, []);

  async function change(value: number) {
    setPerDay(value);
    setFailed(!(await saveProfile({ newCardsPerDay: value })));
    notifyDueCountChanged();
  }

  return (
    <>
      <SettingRow label="Level của bạn" hint="Danh sách từ ở bước xem trước lọc theo level này.">
        <LevelSelect showLabel={false} />
      </SettingRow>
      <SettingRow label="Thẻ mới mỗi ngày" hint="Thẻ cần ôn lại không bị giới hạn; chỉ thẻ mới theo hạn mức này.">
        <SelectField aria-label="Thẻ mới mỗi ngày" value={perDay} onChange={(e) => change(Number(e.target.value))}>
          {[...new Set([...NEW_CARDS_OPTIONS, perDay])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n} thẻ</option>)}
        </SelectField>
      </SettingRow>
      {failed && <p role="alert" className="py-1 text-label-md text-error">Chưa lưu được thiết lập. Kiểm tra kết nối nhé.</p>}
    </>
  );
}
