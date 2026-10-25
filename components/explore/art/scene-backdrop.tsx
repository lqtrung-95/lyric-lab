/** Phần tường chiếm bao nhiêu % chiều cao khung (sàn là phần còn lại). */
export const WALL_PERCENT = 33;

/** Nền phòng: tường kem có chấm nhỏ, len chân tường gỗ, sàn ván có đường kẻ, thảm xanh viền mực; nét viền mực nâu như thẻ của app. */
export function SceneBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-x-0 top-0" style={{ height: `${WALL_PERCENT}%`, backgroundColor: "#fff1d3", backgroundImage: "radial-gradient(rgba(74,46,27,.10) 2px, transparent 2.5px)", backgroundSize: "24px 24px", borderBottom: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0" style={{ top: `${WALL_PERCENT - 4}%`, height: "4%", background: "#c27a3c", borderTop: "3px solid #4a2e1b" }} />
      <div className="absolute inset-x-0 bottom-0" style={{ top: `${WALL_PERCENT}%`, backgroundColor: "#f6cf8e", backgroundImage: "repeating-linear-gradient(0deg, transparent 0 44px, rgba(74,46,27,.28) 44px 46px)" }} />
      <div className="absolute" style={{ left: "34%", top: "64%", width: "50%", height: "30%", borderRadius: "50%", background: "#bcf1a9", border: "3px solid #4a2e1b", boxShadow: "inset 0 0 0 7px #7fc468, 0 4px 0 rgba(74,46,27,.25)" }} />
    </div>
  );
}
