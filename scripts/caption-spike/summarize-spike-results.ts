import type { SpikeRow, Usable } from "./caption-spike-row";

export interface Rate { total: number; yes: number; asr: number; no: number }

const emptyRate = (): Rate => ({ total: 0, yes: 0, asr: 0, no: 0 });
function add(rate: Rate, usable: Usable) {
  rate.total++;
  if (usable === "yes") rate.yes++;
  else if (usable === "asr_unreviewed") rate.asr++;
  else rate.no++;
}

function groupRates<K extends string>(items: { key: K; usable: Usable }[]): Record<string, Rate> {
  const out: Record<string, Rate> = {};
  for (const { key, usable } of items) add((out[key] ??= emptyRate()), usable);
  return out;
}

const percentile = (values: number[], p: number) => {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
};

export function summarizeSpike(rows: SpikeRow[]) {
  const video = emptyRate();
  rows.forEach((r) => add(video, r.usable));

  // Mức bài: lấy kết quả tốt nhất trong các video của bài (yes > asr_unreviewed > no).
  const rank: Record<Usable, number> = { yes: 2, asr_unreviewed: 1, no: 0 };
  const bestBySong = new Map<number, { group: string; usable: Usable }>();
  for (const r of rows) {
    const cur = bestBySong.get(r.songId);
    if (!cur || rank[r.usable] > rank[cur.usable]) bestBySong.set(r.songId, { group: r.group, usable: r.usable });
  }
  const song = emptyRate();
  bestBySong.forEach((s) => add(song, s.usable));

  const errors: Record<string, number> = {};
  rows.forEach((r) => r.errorType && (errors[r.errorType] = (errors[r.errorType] ?? 0) + 1));

  const withOracle = rows.filter((r) => r.oracle);
  const agree = withOracle.filter((r) => {
    const hasManualZh = r.tracks.some((t) => /^(zh|yue)/i.test(t) && t.endsWith("/manual"));
    return hasManualZh === r.oracle!.manualZh;
  }).length;

  return {
    video,
    song,
    videoByRole: groupRates(rows.map((r) => ({ key: r.role, usable: r.usable }))),
    songByGroup: groupRates([...bestBySong.values()].map((s) => ({ key: s.group, usable: s.usable }))),
    errors,
    romanizedTracks: rows.filter((r) => r.trackIsRomanized).length,
    scripts: rows.reduce<Record<string, number>>((o, r) => {
      if (r.quality?.verdict === "ok") o[r.quality.script] = (o[r.quality.script] ?? 0) + 1;
      return o;
    }, {}),
    oracleAgreement: { compared: withOracle.length, agree },
    latencyMs: { p50: percentile(rows.map((r) => r.latencyMs), 0.5), p90: percentile(rows.map((r) => r.latencyMs), 0.9) },
  };
}
