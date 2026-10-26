import type { Metadata } from "next";
import { ExploreHub, type CaseSummary } from "@/components/explore/explore-hub";
import { CASES } from "@/lib/explore/story/cases";

export const metadata: Metadata = { title: "Khám phá", robots: { index: false } };

/** Khám phá: chọn một vụ án để phá hoặc một cảnh để học từ theo ngữ cảnh. */
export default function ExploreIndexPage() {
  const cases: CaseSummary[] = Object.values(CASES).map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty, blurb: c.blurb, startScene: c.startScene, solvedFlag: c.solvedFlag, objectives: c.objectives }));
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">Khám phá</h1>
        <p className="text-body-md text-on-surface-variant">Đi quanh các cảnh để học từ tiếng Trung theo ngữ cảnh, hoặc phá án bằng tiếng Trung.</p>
      </header>
      <ExploreHub cases={cases} />
      <p className="text-label-md text-on-surface-variant">Nhạc nền: leberch, the_mountain, MondaMusic (Pixabay).</p>
    </div>
  );
}
