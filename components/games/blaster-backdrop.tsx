const TILE = (size: number, dots: [number, number, number][]): React.CSSProperties => ({
  backgroundImage: dots.map(([x, y, r]) => `radial-gradient(${r}px ${r}px at ${x}px ${y}px, #fff, transparent)`).join(","),
  backgroundSize: `${size}px ${size}px`, ["--tile" as string]: `${size}px`,
});
const NEBULA = "radial-gradient(60% 50% at 15% 20%, rgba(124,58,237,.28), transparent), radial-gradient(55% 45% at 85% 70%, rgba(14,165,233,.22), transparent), linear-gradient(to bottom, #040816, #0a1d4a)";
export const PARTICLES = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, r = 38 + (i % 3) * 16; return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, color: ["#fbbf24", "#fb923c", "#fff", "#f87171"][i % 4] }; });

/** Nền vũ trụ dùng chung của các chế độ Bắn chữ: tinh vân và ba lớp sao trôi với tốc độ khác nhau (tạo cảm giác chiều sâu). */
export function StarBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: NEBULA }} />
      <div aria-hidden="true" className="bz-drift bz-twinkle absolute inset-0 opacity-80" style={{ ...TILE(180, [[20, 30, 1], [90, 90, 1.2], [150, 20, 1]]), ["--dur" as string]: "14s" }} />
      <div aria-hidden="true" className="bz-drift absolute inset-0 opacity-60" style={{ ...TILE(260, [[40, 60, 1.4], [200, 140, 1], [120, 230, 1.6]]), ["--dur" as string]: "26s" }} />
      <div aria-hidden="true" className="bz-drift absolute inset-0 opacity-40" style={{ ...TILE(340, [[70, 40, 1], [250, 180, 1.3], [160, 300, 1]]), ["--dur" as string]: "44s" }} />
    </>
  );
}

/** Tàu của người chơi (thân, kính lái, lửa đẩy). Vị trí do nơi dùng quyết định. */
export function ShipSprite({ shield = false }: { shield?: boolean }) {
  return (
    <div aria-hidden="true" className="relative flex flex-col items-center">
      {shield && <span className="absolute -inset-3 -top-2 rounded-full border-2 border-cyan-300 bg-cyan-300/15 shadow-[0_0_18px_rgba(103,232,249,.8)]" />}
      <svg viewBox="0 0 48 60" className="h-14 w-11 drop-shadow-[0_0_8px_rgba(34,211,238,.55)]">
        <path d="M14 34 L2 50 L2 56 L17 48Z M34 34 L46 50 L46 56 L31 48Z" fill="#3b82f6" />
        <path d="M24 2 C30 13 34 27 34 42 L24 50 L14 42 C14 27 18 13 24 2Z" fill="#eaf2ff" stroke="#9db8e6" strokeWidth="1.2" />
        <circle cx="24" cy="23" r="5" fill="#22d3ee" stroke="#0e7490" />
      </svg>
      <span className="bz-flame -mt-1 h-4 w-3 rounded-b-full bg-gradient-to-b from-amber-300 via-orange-500 to-transparent" />
    </div>
  );
}
