import type { SceneTheme } from "@/lib/explore/explore-types";

/** Phần tường chiếm bao nhiêu % chiều cao khung (sàn là phần còn lại). */
export const WALL_PERCENT = 33;

/** Nền phòng: tường kem có chấm nhỏ, len chân tường gỗ, sàn ván có đường kẻ, thảm xanh viền mực; nét viền mực nâu như thẻ của app. */
export function SceneBackdrop({ theme }: { theme: SceneTheme }) {
  if (theme === "eatery") return <EateryBackdrop />;
  if (theme !== "room") return <GenericBackdrop theme={theme} />;
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, backgroundColor: "#fff1d3", backgroundImage: "radial-gradient(rgba(74,46,27,.10) 2px, transparent 2.5px)", backgroundSize: "24px 24px", borderBottom: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_PERCENT - 4}%`, height: "4%", background: "#c27a3c", borderTop: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, backgroundColor: "#f6cf8e", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 44px, rgba(74,46,27,.28) 44px 46px)" }} />
      <div className="absolute" style={{ left: "34%", top: "64%", width: "50%", height: "30%", borderRadius: "50%", background: "#bcf1a9", border: "3px solid #4a2e1b", boxShadow: "inset 0 0 0 7px #7fc468, 0 4px 0 rgba(74,46,27,.25)" }} />
    </div>
  );
}

/** Nền quán ăn: tường kem có chấm, chân tường đỏ, sàn gạch caro, hai đèn lồng đỏ treo từ trên xuống. */
function EateryBackdrop() {
  const lantern = (left: string) => (
    <div className="absolute" style={{ left, top: 0, width: "6%", transform: "translateX(-50%)" }}>
      <div style={{ width: 3, height: "10px", background: "#4a2e1b", margin: "0 auto" }} />
      <div style={{ aspectRatio: "0.9", borderRadius: "46%", background: "#e0533d", border: "3px solid #4a2e1b", boxShadow: "inset -5px -4px 0 rgba(0,0,0,.14), inset 5px 4px 0 rgba(255,255,255,.22)" }} />
      <div style={{ width: 3, height: "10px", background: "#4a2e1b", margin: "0 auto" }} />
    </div>
  );
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, backgroundColor: "#fde8c8", backgroundImage: "radial-gradient(rgba(74,46,27,.10) 2px, transparent 2.5px)", backgroundSize: "24px 24px", borderBottom: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_PERCENT - 9}%`, height: "9%", background: "#c4452f", borderTop: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, backgroundColor: "#f3d19a", backgroundImage: "repeating-conic-gradient(#f6d9a0 0% 25%, #ebc182 0% 50%)", backgroundSize: "64px 64px" }} />
      {lantern("12%")}
      {lantern("88%")}
    </div>
  );
}

/** Màu và hoạ tiết riêng cho các cảnh còn lại: tường (hoặc trời), chân tường, sàn (hoặc cỏ). */
const GENERIC: Record<Exclude<SceneTheme, "room" | "eatery">, { wall: string; wallDots: boolean; base: string; floor: string; floorImage: string; floorSize?: string }> = {
  market: { wall: "#fff0c9", wallDots: true, base: "#6fae5a", floor: "#e9cf9a", floorImage: "repeating-linear-gradient(90deg, transparent 0 70px, rgba(74,46,27,.18) 70px 72px)" },
  station: { wall: "#dfeaf3", wallDots: false, base: "#51a0db", floor: "#e5ddd0", floorImage: "repeating-conic-gradient(#ece5d8 0% 25%, #d9d0c1 0% 50%)", floorSize: "72px 72px" },
  hospital: { wall: "#eef7f4", wallDots: false, base: "#7fc9b9", floor: "#f4f1e8", floorImage: "repeating-conic-gradient(#f6f3ea 0% 25%, #e7e3d6 0% 50%)", floorSize: "56px 56px" },
  school: { wall: "#fff4c2", wallDots: true, base: "#7fc468", floor: "#f1cf94", floorImage: "repeating-linear-gradient(90deg, transparent 0 90px, rgba(74,46,27,.2) 90px 92px)" },
  shop: { wall: "#ffe3ec", wallDots: true, base: "#f2a0a0", floor: "#f7dcae", floorImage: "repeating-linear-gradient(0deg, transparent 0 44px, rgba(74,46,27,.18) 44px 46px)" },
  hotel: { wall: "#f8e8d0", wallDots: true, base: "#b83a2a", floor: "#d98a7a", floorImage: "repeating-conic-gradient(#e19484 0% 25%, #d38172 0% 50%)", floorSize: "60px 60px" },
  airport: { wall: "#e3f0fb", wallDots: false, base: "#7fa8d6", floor: "#dcdfe6", floorImage: "repeating-linear-gradient(90deg, transparent 0 110px, rgba(74,46,27,.14) 110px 112px)" },
  library: { wall: "#ecd7b3", wallDots: true, base: "#8a5530", floor: "#c9715f", floorImage: "repeating-linear-gradient(90deg, transparent 0 70px, rgba(74,46,27,.18) 70px 72px)" },
  supermarket: { wall: "#e6f4df", wallDots: false, base: "#7fc468", floor: "#e3e6e8", floorImage: "repeating-conic-gradient(#eceff1 0% 25%, #dadfe2 0% 50%)", floorSize: "64px 64px" },
  beach: { wall: "#bfe3f7", wallDots: false, base: "#51a0db", floor: "#f6e2b0", floorImage: "radial-gradient(rgba(194,122,60,.28) 2px, transparent 2.5px)", floorSize: "26px 26px" },
  office: { wall: "#eef1f6", wallDots: false, base: "#6d8cb0", floor: "#cfd5dd", floorImage: "repeating-conic-gradient(#d5dae1 0% 25%, #c7ced8 0% 50%)", floorSize: "60px 60px" },
  kitchen: { wall: "#f6f1e6", wallDots: false, base: "#b9a58f", floor: "#f3c98b", floorImage: "repeating-conic-gradient(#f6d29a 0% 25%, #eebd78 0% 50%)", floorSize: "60px 60px" },
  bakery: { wall: "#ffe3ec", wallDots: true, base: "#8a5530", floor: "#fff0d8", floorImage: "repeating-conic-gradient(#fff6e4 0% 25%, #f7dcc0 0% 50%)", floorSize: "56px 56px" },
  museum: { wall: "#efe6d6", wallDots: false, base: "#8a5530", floor: "#d9d2c6", floorImage: "repeating-linear-gradient(90deg, transparent 0 120px, rgba(74,46,27,.16) 120px 122px)" },
  stadium: { wall: "#cfe9f8", wallDots: false, base: "#3b6931", floor: "#8fd275", floorImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 60px, transparent 60px 120px)" },
  bank: { wall: "#e9e3d3", wallDots: false, base: "#3b6931", floor: "#dcd6c8", floorImage: "repeating-conic-gradient(#e4dfd2 0% 25%, #cfc8b8 0% 50%)", floorSize: "72px 72px" },
  cinema: { wall: "#4a2e3b", wallDots: false, base: "#b83a2a", floor: "#8a3b3b", floorImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.16) 0 56px, transparent 56px 112px)" },
  gym: { wall: "#e1ecf5", wallDots: false, base: "#51a0db", floor: "#e7a85c", floorImage: "repeating-linear-gradient(0deg, transparent 0 40px, rgba(74,46,27,.2) 40px 42px)" },
  postoffice: { wall: "#e8eef7", wallDots: false, base: "#51a0db", floor: "#d9c7a8", floorImage: "repeating-linear-gradient(90deg, transparent 0 60px, rgba(74,46,27,.14) 60px 62px)" },
  pharmacy: { wall: "#eaf7f1", wallDots: false, base: "#3fa8a0", floor: "#f4f1ea", floorImage: "repeating-conic-gradient(#f7f4ee 0% 25%, #e3ede6 0% 50%)", floorSize: "56px 56px" },
  phoneshop: { wall: "#e6e8f5", wallDots: true, base: "#6a5fb8", floor: "#d8d4e3", floorImage: "repeating-linear-gradient(0deg, transparent 0 44px, rgba(74,46,27,.12) 44px 46px)" },
  zoo: { wall: "#d7efe2", wallDots: false, base: "#7fc468", floor: "#c9e4a8", floorImage: "radial-gradient(rgba(59,105,49,.22) 2px, transparent 2.5px)", floorSize: "28px 28px" },
  flowershop: { wall: "#fbe5ec", wallDots: true, base: "#e07a9a", floor: "#f4e6d4", floorImage: "repeating-conic-gradient(#f8ecdc 0% 25%, #ecd9c2 0% 50%)", floorSize: "56px 56px" },
  garage: { wall: "#dfe3e8", wallDots: false, base: "#e67e22", floor: "#9aa0a6", floorImage: "repeating-linear-gradient(0deg, transparent 0 46px, rgba(0,0,0,.14) 46px 48px)" },
  funfair: { wall: "#d6ecff", wallDots: false, base: "#e0533d", floor: "#f2d9a4", floorImage: "repeating-linear-gradient(90deg, rgba(224,83,61,.14) 0 32px, transparent 32px 64px)" },
  farm: { wall: "#cfe9f8", wallDots: false, base: "#7fc468", floor: "#9bd37a", floorImage: "repeating-linear-gradient(0deg, rgba(59,105,49,.18) 0 4px, transparent 4px 36px)" },
  laundry: { wall: "#e6f3fb", wallDots: true, base: "#51a0db", floor: "#e8eef2", floorImage: "repeating-conic-gradient(#eef3f6 0% 25%, #dbe5ea 0% 50%)", floorSize: "56px 56px" },
  police: { wall: "#dde6f2", wallDots: false, base: "#3f6fb0", floor: "#c9d3e0", floorImage: "repeating-conic-gradient(#d2dae6 0% 25%, #bcc7d6 0% 50%)", floorSize: "56px 56px" },
  subway: { wall: "#e2e6ea", wallDots: false, base: "#2f6fb8", floor: "#b8bdc4", floorImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 3px, transparent 3px 70px)" },
  camping: { wall: "#16233f", wallDots: true, base: "#2f5a3a", floor: "#5f8a46", floorImage: "radial-gradient(rgba(30,60,30,.3) 2px, transparent 2.5px)", floorSize: "26px 26px" },
  cafe: { wall: "#ead9c4", wallDots: false, base: "#7a4e2d", floor: "#c89b6a", floorImage: "repeating-linear-gradient(90deg, rgba(90,50,20,.18) 0 3px, transparent 3px 64px)" },
  bookstore: { wall: "#e9dcc3", wallDots: false, base: "#6b4a2b", floor: "#b98b5a", floorImage: "repeating-linear-gradient(0deg, rgba(60,30,10,.16) 0 2px, transparent 2px 46px)" },
  pool: { wall: "#d6f0f5", wallDots: false, base: "#3f9fc4", floor: "#8fd3e6", floorImage: "repeating-conic-gradient(#9adbec 0% 25%, #82cde2 0% 50%)", floorSize: "48px 48px" },
  firestation: { wall: "#f3e0d8", wallDots: false, base: "#b83a2a", floor: "#c9c3bd", floorImage: "repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 3px, transparent 3px 80px)" },
  lab: { wall: "#e8f3f1", wallDots: false, base: "#3fa8a0", floor: "#e9eef0", floorImage: "repeating-conic-gradient(#f0f4f5 0% 25%, #dde5e8 0% 50%)", floorSize: "56px 56px" },
  toyshop: { wall: "#fff0c9", wallDots: true, base: "#e67e22", floor: "#f6e0b0", floorImage: "repeating-conic-gradient(#f9e8bf 0% 25%, #f0d79a 0% 50%)", floorSize: "56px 56px" },
  bubbletea: { wall: "#ffe9f0", wallDots: true, base: "#f2a0a0", floor: "#fff3d6", floorImage: "repeating-conic-gradient(#fff8e6 0% 25%, #ffe9c4 0% 50%)", floorSize: "56px 56px" },
  hotpot: { wall: "#f6d9c8", wallDots: false, base: "#b83a2a", floor: "#c27a3c", floorImage: "repeating-linear-gradient(90deg, rgba(74,46,27,.18) 0 3px, transparent 3px 64px)" },
  salon: { wall: "#f5e6f1", wallDots: true, base: "#b86aa0", floor: "#f0e4d8", floorImage: "repeating-conic-gradient(#f6ece2 0% 25%, #e8d8c8 0% 50%)", floorSize: "56px 56px" },
  park: { wall: "#cfe9f8", wallDots: false, base: "#7fc468", floor: "#a8dd8f", floorImage: "radial-gradient(rgba(59,105,49,.25) 2px, transparent 2.5px)", floorSize: "30px 30px" },
};

/** Nền chung: tường có chấm nhẹ, dải chân tường, sàn có hoạ tiết; công viên có mây trên trời. */
function GenericBackdrop({ theme }: { theme: Exclude<SceneTheme, "room" | "eatery"> }) {
  const g = GENERIC[theme];
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, backgroundColor: g.wall, backgroundImage: g.wallDots ? "radial-gradient(rgba(74,46,27,.10) 2px, transparent 2.5px)" : undefined, backgroundSize: "24px 24px", borderBottom: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_PERCENT - 5}%`, height: "5%", background: g.base, borderTop: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, backgroundColor: g.floor, backgroundImage: g.floorImage, backgroundSize: g.floorSize }} />
      {theme === "park" && [["12%", 6, 12], ["58%", 10, 9]].map(([left, top, w]) => <div key={String(left)} className="absolute rounded-full" style={{ left, top: `${top}%`, width: `${w}%`, height: "5%", background: "#ffffff", border: "3px solid #4a2e1b" }} />)}
    </div>
  );
}
