import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PRACTICE_MODES } from "./scoring";
import { VIDEO_STUDY_MODES } from "./video-study";

const DIR = join(process.cwd(), "supabase/migrations");

/** Danh sách chế độ hợp lệ của migration CUỐI CÙNG định nghĩa lại `practice_scores_mode_check` (migration sau thắng migration trước). */
function currentModesInDb(): string[] {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
  let modes: string[] = [];
  for (const f of files) {
    const sql = readFileSync(join(DIR, f), "utf8");
    const m = sql.match(/add constraint practice_scores_mode_check\s+check \(mode in \(([^)]*)\)\)/i);
    if (m) modes = [...m[1].matchAll(/'([a-z]+)'/g)].map((x) => x[1]);
  }
  return modes;
}

describe("chế độ hợp lệ của practice_scores trong migration", () => {
  it("migration cuối cùng cho phép mọi chế độ mà code ghi vào bảng (luyện tập, Khám phá, chép/nói video)", () => {
    const allowed = new Set(currentModesInDb());
    for (const mode of [...PRACTICE_MODES, ...VIDEO_STUDY_MODES]) expect(allowed.has(mode), mode).toBe(true);
  });
});
