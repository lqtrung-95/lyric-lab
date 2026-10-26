/** Số vụ án đã giải (và riêng vụ mức Khó) từ khối `story` của người dùng: `{ cases: { [caseId]: { flags: string[] } } }`. */
export function countSolvedCases(raw: unknown, defs: Record<string, { difficulty: string; solvedFlag: string }>): { solved: number; hardSolved: number } {
  const cases = (raw as { cases?: Record<string, unknown> } | null)?.cases;
  let solved = 0;
  let hardSolved = 0;
  if (!cases || typeof cases !== "object") return { solved, hardSolved };
  for (const [id, progress] of Object.entries(cases)) {
    const def = defs[id];
    const flags = (progress as { flags?: unknown } | null)?.flags;
    if (!def || !Array.isArray(flags) || !flags.includes(def.solvedFlag)) continue;
    solved++;
    if (def.difficulty === "hard") hardSolved++;
  }
  return { solved, hardSolved };
}
