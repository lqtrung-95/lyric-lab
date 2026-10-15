import { TONE_TEMPLATES, type ToneId } from "@/lib/pronunciation/tone-data";
import { resample } from "@/lib/pronunciation/pitch";

const W = 280, H = 120, PAD = 12;
const path = (values: number[], lo: number, hi: number) =>
  values.map((v, i) => `${i ? "L" : "M"}${(PAD + (i * (W - 2 * PAD)) / (values.length - 1)).toFixed(1)},${(H - PAD - ((v - lo) / (hi - lo || 1)) * (H - 2 * PAD)).toFixed(1)}`).join(" ");

/** Vẽ đường cao độ mẫu của thanh (nét đứt) và đường giọng người học (nét liền) trên cùng một khung; cả hai dịch về cùng trung tâm nên so được hình dạng, không phải độ cao tuyệt đối. */
export function ToneContourChart({ tone, contour }: { tone: ToneId; contour?: number[] }) {
  const template = TONE_TEMPLATES[tone];
  const mine = contour && contour.length >= 2 ? resample(contour, 20) : null;
  const center = (v: number[]) => { const m = (Math.max(...v) + Math.min(...v)) / 2; return v.map((x) => x - m); };
  const tpl = center(resample(template, 20));
  const user = mine ? center(mine) : null;
  const all = user ? [...tpl, ...user] : tpl;
  const lo = Math.min(...all, -2), hi = Math.max(...all, 2);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={user ? `Đường cao độ của bạn so với thanh ${tone} mẫu` : `Đường cao độ mẫu của thanh ${tone}`} className="w-full max-w-sm rounded-xl bg-surface-container-low">
      <path d={path(tpl, lo, hi)} fill="none" strokeWidth={4} strokeDasharray="6 6" strokeLinecap="round" className="stroke-outline" />
      {user && <path d={path(user, lo, hi)} fill="none" strokeWidth={4} strokeLinecap="round" className="stroke-primary" />}
    </svg>
  );
}
