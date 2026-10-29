"use client";

import { useState } from "react";
import { GrammarDrillRunner } from "@/components/grammar/grammar-drill-runner";
import { buildDrills, type Drill } from "@/lib/grammar/drills";
import { patternsOfLevel } from "@/lib/grammar/grammar-patterns";
import type { GrammarLevel } from "@/lib/grammar/grammar-types";

const TEST_SIZE = 12;

/** Bài thi cuối cấp: 12 câu trộn từ mọi mẫu của cấp (hoặc một mẫu), mỗi lượt xáo mới. */
export function GrammarTest({ level, patternId, title }: { level: GrammarLevel; patternId?: string; title: string }) {
  const make = () => {
    const pats = patternsOfLevel(level).filter((p) => !patternId || p.id === patternId);
    return buildDrills(pats, patternId ? 3 : TEST_SIZE);
  };
  const [drills, setDrills] = useState<Drill[] | null>(null);
  const [round, setRound] = useState(0);
  if (!drills) {
    return (
      <div className="card-ink p-space-lg text-center">
        <p className="text-body-lg">{patternId ? "3 câu luyện riêng mẫu này: xếp từ, điền chỗ trống và chọn câu đúng." : `${TEST_SIZE} câu trộn từ mọi mẫu của cấp: xếp từ, điền chỗ trống và chọn câu đúng.`}</p>
        <button type="button" onClick={() => setDrills(make())} className="btn-3d btn-3d-primary mt-space-md min-h-12 px-8 font-extrabold">Bắt đầu</button>
      </div>
    );
  }
  return <GrammarDrillRunner key={round} drills={drills} title={title} onAgain={() => { setDrills(make()); setRound((r) => r + 1); }} />;
}
