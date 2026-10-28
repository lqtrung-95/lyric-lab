import { GROUP_ARTICULATION, SOUND_ARTICULATION } from "@/lib/pronunciation/articulation-data";
import type { SoundGroup } from "@/lib/pronunciation/pinyin-chart-data";
import { ArticulationBlock } from "./articulation-block";
import { SoundRow } from "./sound-row";
import { VowelExplorer } from "./vowel-explorer";

/**
 * Một nhóm âm thành một thẻ gọn: tiêu đề và ghi chú ở trên; nhóm cùng một chỗ đặt lưỡi thì có khối hình + mô tả (kèm khối riêng cho âm lẻ như f),
 * rồi danh sách các âm đều nhau bên dưới. Nhóm nguyên âm đơn (mỗi âm một chỗ đặt lưỡi) dùng dạng chọn-xem (`VowelExplorer`).
 */
export function SoundGroupCard({ group }: { group: SoundGroup }) {
  const art = GROUP_ARTICULATION[group.id];
  const own = group.sounds.filter((s) => SOUND_ARTICULATION[s.symbol]);
  const perSound = !art && own.length > 0;
  return (
    <section aria-labelledby={`g-${group.id}`} className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low">
      <header className="border-b border-outline-variant px-space-md py-space-sm">
        <h3 id={`g-${group.id}`} className="font-serif text-headline-md">{group.title}</h3>
        {group.note && <p className="text-body-md text-on-surface-variant">{group.note}</p>}
      </header>
      <div className="flex flex-col gap-space-md p-space-md">
        {art && <ArticulationBlock art={art} label={group.sounds.filter((s) => !SOUND_ARTICULATION[s.symbol]).map((s) => s.symbol).join(", ")} />}
        {art && own.map((s) => (
          <div key={s.symbol} className="border-t border-outline-variant pt-space-md">
            <ArticulationBlock art={SOUND_ARTICULATION[s.symbol]} label={s.symbol} title={`Riêng âm ${s.symbol}`} />
          </div>
        ))}
        {perSound ? (
          <VowelExplorer sounds={group.sounds} />
        ) : (
          <ul className="grid items-stretch gap-space-sm sm:grid-cols-2">
            {group.sounds.map((s) => <SoundRow key={s.symbol} sound={s} />)}
          </ul>
        )}
      </div>
    </section>
  );
}
