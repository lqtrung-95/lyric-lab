"use client";

import type { LevelChip, LevelFilter } from "@/lib/preview/build-preview-view";
import { levelLabel } from "@/lib/preview/preview-format";
import { LevelSelect } from "./level-select";

interface LevelFilterBarProps {
  chips: LevelChip[];
  active: LevelFilter;
  onChange: (f: LevelFilter) => void;
  userLevel: number;
  hiddenBelowLevel: number;
  showEasy: boolean;
  onToggleEasy: () => void;
  knownCount: number;
  onUndoKnown: (() => void) | null;
}

/** Thanh lọc (PV-04, PV-05): chip theo cấp, level của người dùng, mục đã ẩn, mục đã biết + Hoàn tác. */
export function LevelFilterBar({ chips, active, onChange, userLevel, hiddenBelowLevel, showEasy, onToggleEasy, knownCount, onUndoKnown }: LevelFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-surface-container p-3.5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div role="group" aria-label="Lọc theo cấp" className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <button
            key={String(chip.key)}
            type="button"
            aria-pressed={chip.key === active}
            onClick={() => onChange(chip.key)}
            className={`min-h-11 rounded-full px-3.5 text-label-sm transition-colors ${
              chip.key === active ? "bg-primary text-on-primary shadow-sm" : "bg-surface text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {chip.label} ({chip.count})
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-label-md text-on-surface-variant">
        <LevelSelect />
        {(hiddenBelowLevel > 0 || showEasy) && (
          <button type="button" onClick={onToggleEasy} className="min-h-11 underline decoration-outline-variant underline-offset-4">
            {showEasy ? `Ẩn lại mục dưới ${levelLabel(userLevel)}` : `Đã ẩn ${hiddenBelowLevel} mục dưới ${levelLabel(userLevel)} · Hiện`}
          </button>
        )}
        {knownCount > 0 && (
          <span className="inline-flex items-center gap-2">
            Đã biết {knownCount} mục
            {onUndoKnown && (
              <button type="button" onClick={onUndoKnown} className="min-h-11 font-semibold text-primary underline underline-offset-4">Hoàn tác</button>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
