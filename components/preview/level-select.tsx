"use client";

import { SelectField } from "@/components/ui/select-field";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { levelOptionLabel } from "@/lib/preview/preview-format";

const LEVELS = [1, 2, 3, 4, 5, 6, 7];

/** Chọn level của người dùng (HSK 3.0). Đổi level là cập nhật danh sách ngay, không gọi AI (PV-04). */
export function LevelSelect({ className = "", showLabel = true }: { className?: string; showLabel?: boolean }) {
  const { state, setLevel } = useLearnerState();
  return (
    <label className={`inline-flex items-center gap-2 text-label-md text-on-surface-variant ${className}`}>
      {showLabel ? <span>Level của bạn</span> : <span className="sr-only">Level của bạn</span>}
      <SelectField
        value={state.level}
        onChange={(e) => setLevel(Number(e.target.value))}
      >
        {LEVELS.map((l) => (
          <option key={l} value={l}>
            {levelOptionLabel(l)}
          </option>
        ))}
      </SelectField>
    </label>
  );
}
