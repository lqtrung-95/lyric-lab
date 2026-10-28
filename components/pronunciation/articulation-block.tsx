import type { Articulation } from "@/lib/pronunciation/articulation-data";
import { TongueDiagram } from "./tongue-diagram";

/** Một khối "hình + mô tả vị trí lưỡi": hình cắt dọc miệng ở cột trái, chữ ở cột phải (màn hẹp xếp dọc). `label` là các âm áp dụng. */
export function ArticulationBlock({ art, label, title = "Vị trí lưỡi và môi" }: { art: Articulation; label: string; title?: string }) {
  return (
    <div className="grid items-center gap-space-md md:grid-cols-[minmax(0,240px)_1fr]">
      <TongueDiagram kind={art.diagram} alt={`Hình cắt dọc miệng khi phát âm ${label}: ${art.where}`} className="mx-auto w-full max-w-[240px]" />
      <div className="min-w-0">
        <p className="text-label-lg font-extrabold text-primary">{title}</p>
        <p className="mt-1 border-l-4 border-primary pl-3 text-body-lg">{art.where}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-body-md text-on-surface-variant">
          {art.how.map((h) => <li key={h}>{h}</li>)}
        </ul>
      </div>
    </div>
  );
}
