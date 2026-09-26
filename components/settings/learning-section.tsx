"use client";

import { useEffect, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { LevelSelect } from "@/components/preview/level-select";
import { DEFAULT_PROFILE, NEW_CARDS_OPTIONS, fetchProfile, saveProfile } from "@/lib/user-data/profile-repo";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";

/** Cài đặt học: level HSK và số thẻ mới mỗi ngày (mặc định 15). */
export function LearningSection() {
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
    <section aria-labelledby="learning-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="learning-heading" className="font-serif text-headline-md text-on-surface">Học tập</h2>
      <div className="mt-space-md flex flex-col gap-space-md">
        <div>
          <LevelSelect />
          <p className="mt-1 text-label-md text-on-surface-variant">Danh sách từ ở bước xem trước lọc theo level này.</p>
        </div>
        <div>
          <label className="inline-flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>Thẻ mới mỗi ngày</span>
            <SelectField value={perDay} onChange={(e) => change(Number(e.target.value))}>
              {[...new Set([...NEW_CARDS_OPTIONS, perDay])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n} thẻ</option>)}
            </SelectField>
          </label>
          <p className="mt-1 text-label-md text-on-surface-variant">Thẻ cần ôn lại không bị giới hạn; chỉ thẻ mới theo hạn mức này.</p>
          {failed && <p role="alert" className="mt-1 text-label-md text-error">Chưa lưu được thiết lập. Kiểm tra kết nối nhé.</p>}
        </div>
      </div>
    </section>
  );
}
