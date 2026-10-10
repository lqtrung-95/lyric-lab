"use client";

import { useEffect, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { LevelSelect } from "@/components/preview/level-select";
import { DAILY_GOAL_OPTIONS, DEFAULT_DAILY_GOAL } from "@/lib/streak/daily-goal";
import { DEFAULT_PROFILE, NEW_CARDS_OPTIONS, fetchDailyGoal, fetchProfile, saveDailyGoal, saveProfile } from "@/lib/user-data/profile-repo";
import { notifyDueCountChanged } from "@/lib/review/due-count-event";
import { SettingRow } from "./settings-card";

/** Ba dòng cài đặt học: level HSK, số thẻ mới mỗi ngày (mặc định 15) và mục tiêu học mỗi ngày (mặc định 10 mục). */
export function LearningRows() {
  const [perDay, setPerDay] = useState<number>(DEFAULT_PROFILE.newCardsPerDay);
  const [goal, setGoal] = useState<number>(DEFAULT_DAILY_GOAL);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetchProfile().then((p) => setPerDay(p.newCardsPerDay), () => {});
    fetchDailyGoal().then(setGoal, () => {});
  }, []);

  async function change(value: number) {
    setPerDay(value);
    setFailed(!(await saveProfile({ newCardsPerDay: value })));
    notifyDueCountChanged();
  }

  async function changeGoal(value: number) {
    setGoal(value);
    setFailed(!(await saveDailyGoal(value)));
  }

  return (
    <>
      <SettingRow label="Level của bạn" hint="HSK N nghĩa là bạn đã biết HSK 1 đến N−1. Từ dưới level bị ẩn khỏi danh sách xem trước; chọn “Chưa biết gì” nếu mới bắt đầu.">
        <LevelSelect showLabel={false} />
      </SettingRow>
      <SettingRow label="Thẻ mới mỗi ngày" hint="Thẻ cần ôn lại không bị giới hạn; chỉ thẻ mới theo hạn mức này.">
        <SelectField aria-label="Thẻ mới mỗi ngày" value={perDay} onChange={(e) => change(Number(e.target.value))}>
          {[...new Set([...NEW_CARDS_OPTIONS, perDay])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n} thẻ</option>)}
        </SelectField>
      </SettingRow>
      <SettingRow label="Mục tiêu mỗi ngày" hint="Một mục là một lần chấm thẻ ôn, một câu chép chính tả hoặc luyện nói theo video, hoặc một câu hỏi luyện tập. Tiến độ hiện ở thẻ chuỗi ngày trên trang chủ.">
        <SelectField aria-label="Mục tiêu mỗi ngày" value={goal} onChange={(e) => void changeGoal(Number(e.target.value))}>
          {DAILY_GOAL_OPTIONS.map((n) => <option key={n} value={n}>{n === 0 ? "Tắt" : `${n} mục`}</option>)}
        </SelectField>
      </SettingRow>
      {failed && <p role="alert" className="py-1 text-label-md text-error">Chưa lưu được thiết lập. Kiểm tra kết nối nhé.</p>}
    </>
  );
}
