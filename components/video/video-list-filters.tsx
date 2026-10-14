import { VIDEO_BANDS, VIDEO_SORTS, type BandId, type VideoSort } from "@/lib/video/video-level-filter";
import { VIDEO_TAGS, type VideoTagId } from "@/lib/video/video-tags";

const chip = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-label-md font-medium transition-colors";

/**
 * Bộ lọc danh sách video theo cấp HSK (nút bấm, mặc định "Tất cả") nút "Nhóm theo kênh" (chỉ khi có `onGrouped`, trang một kênh không cần) và ô chọn cách sắp xếp. Dải trống bị ẩn; dải hợp với level của người học được đánh dấu
 * "hợp bạn" nhưng KHÔNG tự chọn, để người mới vẫn thấy toàn bộ video.
 */
export function VideoListFilters({ counts, total, band, onBand, sort, onSort, suggested, grouped, onGrouped, tagCounts, tag, onTag }: {
  counts: Record<BandId, number>; total: number; band: BandId | null; onBand: (b: BandId | null) => void;
  sort: VideoSort; onSort: (s: VideoSort) => void; suggested: BandId; grouped?: boolean; onGrouped?: (g: boolean) => void;
  /** Lọc theo thẻ chủ đề (hoạt hình, vlog...): chỉ hiện khi truyền đủ ba giá trị và có thẻ nào đó có video. */
  tagCounts?: Record<VideoTagId, number>; tag?: VideoTagId | null; onTag?: (t: VideoTagId | null) => void;
}) {
  const on = "bg-primary text-on-primary";
  const off = "bg-surface-container-high text-on-surface hover:bg-surface-container-highest";
  return (
    <div className="space-y-3">
      {tagCounts && onTag && VIDEO_TAGS.some((t) => tagCounts[t.id] > 0) && (
        <div role="group" aria-label="Lọc theo chủ đề" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={!tag} onClick={() => onTag(null)} className={`${chip} ${!tag ? on : off}`}>Mọi chủ đề</button>
          {VIDEO_TAGS.filter((t) => tagCounts[t.id] > 0).map((t) => (
            <button key={t.id} type="button" aria-pressed={tag === t.id} onClick={() => onTag(tag === t.id ? null : t.id)} className={`${chip} ${tag === t.id ? on : off}`}>{t.label} <span className="opacity-70">{tagCounts[t.id]}</span></button>
          ))}
        </div>
      )}
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div role="group" aria-label="Lọc theo cấp HSK" className="flex flex-wrap gap-2">
        <button type="button" aria-pressed={band === null} onClick={() => onBand(null)} className={`${chip} ${band === null ? on : off}`}>Tất cả <span className="opacity-70">{total}</span></button>
        {VIDEO_BANDS.filter((b) => counts[b.id] > 0).map((b) => (
          <button key={b.id} type="button" aria-pressed={band === b.id} onClick={() => onBand(b.id)} className={`${chip} ${band === b.id ? on : off}`}>
            {b.label} <span className="opacity-70">{counts[b.id]}</span>
            {b.id === suggested && <span className={`rounded-full px-2 py-0.5 text-label-sm ${band === b.id ? "bg-on-primary/20" : "bg-secondary-container text-on-secondary-container"}`}>hợp bạn</span>}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
      {onGrouped && <button type="button" aria-pressed={grouped} onClick={() => onGrouped(!grouped)} className={`${chip} ${grouped ? on : off}`}>Nhóm theo kênh</button>}
      <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
        Sắp xếp
        <select value={sort} onChange={(e) => onSort(e.target.value as VideoSort)} className="min-h-11 rounded-full bg-surface-container-high px-4 text-label-md text-on-surface">
          {VIDEO_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
      </div>
    </div>
    </div>
  );
}
