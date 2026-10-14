import { Icon } from "@/components/ui/icon";
import { SelectField } from "@/components/ui/select-field";
import { VIDEO_BANDS, VIDEO_SORTS, type BandId, type VideoSort } from "@/lib/video/video-level-filter";
import { VIDEO_TAGS, type VideoTagId } from "@/lib/video/video-tags";

const chip = "inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-label-md font-medium transition-colors";
const on = "bg-primary text-on-primary";
const off = "bg-surface-container-high text-on-surface hover:bg-surface-container-highest";
// Ô chọn đang lọc (khác mặc định) có viền màu để thấy ngay bộ lọc nào đang bật dù đã gập danh sách.
const active = "ring-2 ring-primary";

/**
 * Nhãn nhỏ đứng trước một ô chọn; bọc cả ô chọn nên bấm chữ cũng mở ô và trình đọc màn hình đọc đúng tên. Trên điện thoại nhãn chỉ dành cho trình đọc màn hình
 * (mục đầu của mỗi ô như "Mọi chủ đề", "Tất cả cấp" đã tự giải thích) để hai ô nằm cạnh nhau trên một hàng.
 */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex min-w-0 items-center gap-2 text-label-md text-on-surface-variant"><span className="sr-only sm:not-sr-only">{label}</span>{children}</label>;
}
const fill = { wrapperClassName: "w-full sm:w-auto", className: "w-full sm:w-auto" };

/**
 * Bộ lọc danh sách video gọn trên MỘT hàng: ô chọn Chủ đề, Cấp độ (HSK) và Sắp xếp, cùng hai nút bật/tắt "Yêu thích" và "Nhóm theo kênh".
 * Ô chọn chỉ liệt kê mục có video (kèm số), nhưng luôn giữ mục đang chọn. Cấp độ hợp với level người học được đánh dấu "hợp bạn" nhưng KHÔNG tự chọn, để người mới vẫn thấy toàn bộ video.
 * `onGrouped` chỉ có ở trang Video (trang một kênh không cần nhóm); các bộ lọc thẻ/yêu thích chỉ hiện khi được truyền.
 */
export function VideoListFilters({ counts, total, band, onBand, sort, onSort, suggested, grouped, onGrouped, tagCounts, tag, onTag, likedCount, onlyLiked, onOnlyLiked }: {
  counts: Record<BandId, number>; total: number; band: BandId | null; onBand: (b: BandId | null) => void;
  sort: VideoSort; onSort: (s: VideoSort) => void; suggested: BandId; grouped?: boolean; onGrouped?: (g: boolean) => void;
  /** Lọc theo thẻ chủ đề (hoạt hình, vlog...): chỉ hiện khi truyền đủ ba giá trị và có thẻ nào đó có video. */
  tagCounts?: Record<VideoTagId, number>; tag?: VideoTagId | null; onTag?: (t: VideoTagId | null) => void;
  /** Nút "Yêu thích" (chỉ lấy video đã tim): hiện khi truyền `onOnlyLiked`, kể cả khi chưa thích video nào (để người dùng biết có tính năng này). */
  likedCount?: number; onlyLiked?: boolean; onOnlyLiked?: (v: boolean) => void;
}) {
  const showTags = tagCounts && onTag && (VIDEO_TAGS.some((t) => tagCounts[t.id] > 0) || tag);
  return (
    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3">
      {showTags && (
        <Field label="Chủ đề">
          <SelectField value={tag ?? ""} onChange={(e) => onTag(e.target.value ? (e.target.value as VideoTagId) : null)} wrapperClassName={fill.wrapperClassName} className={`${fill.className} ${tag ? active : ""}`}>
            <option value="">Mọi chủ đề</option>
            {VIDEO_TAGS.filter((t) => tagCounts[t.id] > 0 || t.id === tag).map((t) => <option key={t.id} value={t.id}>{t.label} ({tagCounts[t.id]})</option>)}
          </SelectField>
        </Field>
      )}
      <Field label="Cấp độ">
        <SelectField value={band ?? ""} onChange={(e) => onBand(e.target.value ? (e.target.value as BandId) : null)} wrapperClassName={fill.wrapperClassName} className={`${fill.className} ${band ? active : ""}`}>
          <option value="">Tất cả cấp ({total})</option>
          {VIDEO_BANDS.filter((b) => counts[b.id] > 0 || b.id === band).map((b) => (
            <option key={b.id} value={b.id}>{b.label} ({counts[b.id]}){b.id === suggested ? " · hợp bạn" : ""}</option>
          ))}
        </SelectField>
      </Field>
      <Field label="Sắp xếp">
        <SelectField value={sort} onChange={(e) => onSort(e.target.value as VideoSort)} {...fill}>
          {VIDEO_SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </SelectField>
      </Field>
      <div className="col-span-2 flex flex-wrap items-center gap-2 sm:ml-auto">
        {onOnlyLiked && (
          <button type="button" aria-pressed={onlyLiked} onClick={() => onOnlyLiked(!onlyLiked)} className={`${chip} ${onlyLiked ? on : off}`}>
            <Icon name={onlyLiked ? "favorite" : "favorite_border"} filled={onlyLiked} size={18} />Yêu thích <span className="opacity-70">{likedCount ?? 0}</span>
          </button>
        )}
        {onGrouped && <button type="button" aria-pressed={grouped} onClick={() => onGrouped(!grouped)} className={`${chip} ${grouped ? on : off}`}>Nhóm theo kênh</button>}
      </div>
    </div>
  );
}
