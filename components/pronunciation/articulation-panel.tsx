import type { Articulation } from "@/lib/pronunciation/articulation-data";
import { TongueDiagram } from "./tongue-diagram";

/** Khung "Vị trí lưỡi và cách phát âm": hình cắt dọc miệng bên trái, chữ mô tả bên phải (chữ là nội dung chính, hình chỉ minh họa). */
export function ArticulationPanel({ articulation, label, stacked = false }: { articulation: Articulation; label: string; stacked?: boolean }) {
  return (
    <div className={`flex flex-col gap-space-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-space-sm ${stacked ? "" : "sm:flex-row sm:items-center"}`}>
      <TongueDiagram kind={articulation.diagram} alt={`Hình cắt dọc miệng khi phát âm ${label}: ${articulation.where}`} className="w-full max-w-[240px] shrink-0 self-center" />
      <div className="min-w-0">
        <p className="text-label-lg font-extrabold">Vị trí lưỡi và môi</p>
        <p className="text-body-md">{articulation.where}</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-body-md text-on-surface-variant">
          {articulation.how.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </div>
    </div>
  );
}
