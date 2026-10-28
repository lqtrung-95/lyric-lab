import { COMPARE_GROUPS } from "@/lib/pronunciation/articulation-data";
import { TongueDiagram } from "./tongue-diagram";

/** Ba nhóm phụ âm hay bị lẫn đặt cạnh nhau: chỉ khác ở chỗ đặt lưỡi. */
export function CompareGroups() {
  return (
    <section aria-labelledby="compare-h" className="overflow-hidden rounded-2xl border border-primary bg-primary-container/30">
      <header className="px-space-md py-space-sm">
        <h3 id="compare-h" className="font-serif text-headline-md">So sánh ba nhóm hay bị lẫn</h3>
        <p className="text-body-md text-on-surface-variant">j q x, zh ch sh r và z c s nghe gần nhau với người Việt; điểm khác chính là chỗ đặt đầu lưỡi. Chấm đỏ là chỗ lưỡi chạm hoặc gần nhất.</p>
      </header>
      <ul className="grid gap-space-sm px-space-md pb-space-md sm:grid-cols-3">
        {COMPARE_GROUPS.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest p-space-sm">
            <TongueDiagram kind={c.diagram} alt={`Hình cắt dọc miệng khi phát âm ${c.label}: ${c.point}`} className="w-full" />
            <p className="font-serif text-headline-md text-primary">{c.label}</p>
            <p className="text-body-md text-on-surface-variant">{c.point}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
