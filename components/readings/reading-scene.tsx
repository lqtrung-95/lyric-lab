import { FLAT_SPRITES } from "@/components/explore/art/flat/flat-sprites";
import { FLOATING_SPRITES, type ReadingScene, type ReadingSky } from "@/lib/readings/reading-scenes";

const W = 400;
const H = 170;
const GROUND_Y = 150;

/** Bảng màu từng bối cảnh: trời trên cùng → chân trời, mặt đất (hoặc sàn nhà/tuyết). */
const SKY: Record<ReadingSky, { top: string; bottom: string; ground: string; line: string }> = {
  day: { top: "#bfe6ff", bottom: "#eaf7ff", ground: "#9be37a", line: "#7ccb5a" },
  night: { top: "#1f2a55", bottom: "#3d4a85", ground: "#3f6b4a", line: "#2f5238" },
  rain: { top: "#9fb0c2", bottom: "#c9d4df", ground: "#7aa58a", line: "#5f8a70" },
  indoor: { top: "#ffe9c9", bottom: "#ffe9c9", ground: "#d9a066", line: "#b9772f" },
  sunset: { top: "#ffb27a", bottom: "#ffe2b8", ground: "#c9b06a", line: "#a8924f" },
  snow: { top: "#d5e4f2", bottom: "#eef5fb", ground: "#ffffff", line: "#dbe7f2" },
};

/**
 * Tranh minh họa một đoạn truyện, ghép từ kho hình phẳng có sẵn (không gọi mạng, không tốn dịch vụ ảnh): nền theo bối cảnh, các hình đứng hàng ngang trên mặt đất,
 * mặt trời/trăng/sao bay trên trời. Chỉ để trang trí (aria-hidden): nội dung đoạn luôn có chữ.
 */
export function ReadingSceneArt({ scene, className = "" }: { scene: ReadingScene; className?: string }) {
  const c = SKY[scene.sky];
  const items = scene.items.filter((id) => FLAT_SPRITES[id]);
  const ground = items.filter((id) => !FLOATING_SPRITES.has(id));
  const floating = items.filter((id) => FLOATING_SPRITES.has(id));
  const slot = (W - 40) / Math.max(1, ground.length);
  const gid = `sky-${scene.sky}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className={`block w-full rounded-2xl ${className}`}>
      <defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c.top} /><stop offset="1" stopColor={c.bottom} /></linearGradient></defs>
      <rect width={W} height={H} fill={`url(#${gid})`} />
      {scene.sky === "night" && [[40, 24], [110, 50], [200, 18], [290, 44], [350, 22], [250, 70]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" fill="#fff6d6" />)}
      {(scene.sky === "day" || scene.sky === "sunset") && <g fill="#fff" opacity="0.85"><ellipse cx="90" cy="34" rx="26" ry="9" /><ellipse cx="110" cy="28" rx="16" ry="8" /><ellipse cx="300" cy="48" rx="24" ry="8" /></g>}
      {scene.sky === "rain" && <g fill="#8296ab" opacity="0.8"><ellipse cx="100" cy="26" rx="40" ry="12" /><ellipse cx="290" cy="34" rx="46" ry="13" />{Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${20 + i * 17} ${50 + (i % 4) * 22}l-4 12`} stroke="#6f86a0" strokeWidth="1.6" fill="none" />)}</g>}
      {scene.sky === "snow" && Array.from({ length: 18 }, (_, i) => <circle key={i} cx={14 + i * 22} cy={12 + ((i * 37) % 100)} r="2.2" fill="#fff" />)}
      <rect y={GROUND_Y - 10} width={W} height={H - GROUND_Y + 10} fill={c.ground} />
      <rect y={GROUND_Y - 10} width={W} height="3" fill={c.line} />
      {floating.map((id, i) => {
        const sp = FLAT_SPRITES[id];
        const k = Math.min(1, 44 / sp.h);
        const x = 40 + (floating.length === 1 ? 300 : (i * 300) / (floating.length - 1));
        // Hình trăng của kho là nét viền mảnh, chìm trên trời đêm: vẽ lại thành lưỡi liềm sáng.
        if (id === "moon") return <path key={id} d={`M${x + 8} 18a22 22 0 1 0 16 38a17 17 0 0 1 -16 -38z`} fill="#fff2b8" />;
        return <g key={id} transform={`translate(${x - (sp.w * k) / 2} ${16}) scale(${k})`}>{sp.node}</g>;
      })}
      {ground.map((id, i) => {
        const sp = FLAT_SPRITES[id];
        const k = Math.min(1.5, (slot * 0.85) / sp.w, 112 / sp.h);
        const cx = 20 + slot * (i + 0.5);
        return <g key={`${id}${i}`} transform={`translate(${cx - (sp.w * k) / 2} ${GROUND_Y + 2 - sp.h * k}) scale(${k})`}>{sp.node}</g>;
      })}
    </svg>
  );
}
