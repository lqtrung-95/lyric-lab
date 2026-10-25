import type { ArtStyle } from "./scene-art";

/** Phần tường chiếm bao nhiêu % chiều cao khung (sàn là phần còn lại). */
export const WALL_PERCENT = 33;

/** Nền phòng theo bộ tranh. AI: màu mềm như tranh vẽ tay; Pixel: mảng màu phẳng, nét cứng. Hai bản dùng cùng bố cục để so sánh công bằng. */
export function SceneBackdrop({ style }: { style: ArtStyle }) {
  if (style === "flat") return <FlatBackdrop />;
  const pixel = style === "pixel";
  const wall = pixel ? { background: "#efe0c2", borderBottom: "6px solid #8a5530" } : { background: "linear-gradient(#f6ead2, #ecdcbc)", borderBottom: "8px solid #b98a5b" };
  const floor = pixel
    ? { background: "repeating-linear-gradient(90deg, #c58a4f 0 40px, #8f5a30 40px 42px)" }
    : { background: "repeating-linear-gradient(90deg, #dba96f 0 64px, #cf9a5e 64px 66px)" };
  const rug = pixel
    ? { background: "#cf4a3e", boxShadow: "inset 0 0 0 4px #f6ead2, inset 0 0 0 8px #962f2f", borderRadius: 0 }
    : { background: "radial-gradient(ellipse, #8fbf7a 0%, #6aa84f 70%)", boxShadow: "0 0 0 4px rgba(246,234,210,.8)", borderRadius: "50%" };
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, ...wall }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, ...floor }} />
      <div className="absolute" style={{ left: "36%", top: "62%", width: "46%", height: "30%", opacity: 0.85, ...rug }} />
    </div>
  );
}

/** Nền Tranh C: tường kem có chấm nhỏ, len chân tường gỗ, sàn ván có đường kẻ, thảm xanh viền mực; nét viền mực nâu như thẻ của app. */
function FlatBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, backgroundColor: "#fff1d3", backgroundImage: "radial-gradient(rgba(74,46,27,.10) 2px, transparent 2.5px)", backgroundSize: "24px 24px", borderBottom: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_PERCENT - 4}%`, height: "4%", background: "#c27a3c", borderTop: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, backgroundColor: "#f6cf8e", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 44px, rgba(74,46,27,.28) 44px 46px)" }} />
      <div className="absolute" style={{ left: "34%", top: "64%", width: "50%", height: "30%", borderRadius: "50%", background: "#bcf1a9", border: "3px solid #4a2e1b", boxShadow: "inset 0 0 0 7px #7fc468, 0 4px 0 rgba(74,46,27,.25)" }} />
    </div>
  );
}
