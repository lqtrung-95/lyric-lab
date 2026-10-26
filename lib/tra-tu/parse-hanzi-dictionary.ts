// Đọc `dictionary.txt` của Make Me a Hanzi (mỗi dòng một JSON): bộ thủ, cách ghép chữ (IDS) và nguồn gốc chữ (etymology).
// Dữ liệu này theo giấy phép LGPL v3+ (nguồn Unihan, CJKlib): giữ ghi nguồn trên giao diện và liên kết tới giấy phép.
export type EtymologyType = "ideographic" | "pictographic" | "pictophonetic";

export interface HanziEtymology { type: EtymologyType; hint?: string; phonetic?: string; semantic?: string }

export interface HanziInfoRow {
  hanzi: string;
  radical: string;
  /** Chuỗi mô tả cấu tạo (IDS, vd. "⿱爫⿻冖友"); null khi nguồn không nhận ra cấu tạo (bắt đầu bằng "？"). */
  decomposition: string | null;
  etymology: HanziEtymology | null;
  /** Nghĩa tiếng Anh của chữ (nguồn Make Me a Hanzi, từ Unihan). */
  definition: string | null;
}

const TYPES: ReadonlySet<string> = new Set(["ideographic", "pictographic", "pictophonetic"]);
const str = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

export function parseHanziDictionary(text: string): HanziInfoRow[] {
  const rows: HanziInfoRow[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    let raw: Record<string, unknown>;
    try { raw = JSON.parse(line) as Record<string, unknown>; } catch { continue; }
    const hanzi = str(raw.character);
    const radical = str(raw.radical);
    if (!hanzi || !radical || [...hanzi].length !== 1) continue;
    const decomposition = str(raw.decomposition);
    const et = raw.etymology as Record<string, unknown> | null | undefined;
    const type = str(et?.type);
    rows.push({
      hanzi, radical,
      decomposition: decomposition && !decomposition.startsWith("？") ? decomposition : null,
      etymology: type && TYPES.has(type) ? { type: type as EtymologyType, hint: str(et?.hint), phonetic: str(et?.phonetic), semantic: str(et?.semantic) } : null,
      definition: str(raw.definition) ?? null,
    });
  }
  return rows;
}
