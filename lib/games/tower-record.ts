/** Kỷ lục của Pet thủ thành, chỉ lưu ở thiết bị này (game không tính XP nên không có bảng điểm máy chủ). */
export interface TowerRecord { bestScore: number; bestWave: number }
export const EMPTY_TOWER_RECORD: TowerRecord = { bestScore: 0, bestWave: 0 };
export const TOWER_RECORD_KEY = "lyric-lab-tower-record";
export const TOWER_RECORD_EVENT = "lyric-lab-tower-record";

export function parseTowerRecord(raw: unknown): TowerRecord {
  if (!raw || typeof raw !== "object") return EMPTY_TOWER_RECORD;
  const r = raw as Record<string, unknown>;
  const n = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
  return { bestScore: n(r.bestScore), bestWave: n(r.bestWave) };
}

/** Gộp kết quả ván vừa xong vào kỷ lục (chỉ tăng). */
export function mergeTowerRecord(rec: TowerRecord, score: number, wave: number): { record: TowerRecord } {
  return { record: { bestScore: Math.max(rec.bestScore, score), bestWave: Math.max(rec.bestWave, wave) } };
}
