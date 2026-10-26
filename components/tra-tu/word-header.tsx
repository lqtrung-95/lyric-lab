import { PronounceButton } from "@/components/ui/pronounce-button";
import { hanSizeClass, hskLabel } from "@/lib/tra-tu/han-display";
import type { WordDetail } from "@/lib/tra-tu/word-detail-types";

/** Đầu trang chi tiết: chữ Hán lớn (giản + phồn), pinyin các cách đọc, cấp HSK, Hán Việt. Mọi trường lấy từ từ điển. */
export function WordHeader({ detail, children }: { detail: WordDetail; children?: React.ReactNode }) {
  const others = detail.traditionalForms.filter((t) => t !== detail.simplified);
  const pinyins = [...new Set(detail.readings.map((r) => r.pinyin))];
  return (
    <section aria-label={`Từ ${detail.simplified}`} className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <div className="flex items-start justify-between gap-3">
        <h1 lang="zh-Hans" className={`${hanSizeClass([...detail.simplified].length)} min-w-0 break-all font-extrabold leading-none`}>{detail.simplified}</h1>
        <PronounceButton text={detail.simplified} className="size-14" />
      </div>
      <p className="text-headline-md font-bold text-primary">{pinyins.join(" · ")}</p>
      <dl className="flex flex-wrap gap-x-space-md gap-y-1 text-body-md">
        {others.length > 0 && <div className="flex gap-1"><dt className="text-on-surface-variant">Phồn thể:</dt><dd lang="zh-Hant" className="font-bold">{others.join(" · ")}</dd></div>}
        {detail.sinoViet && <div className="flex gap-1"><dt className="text-on-surface-variant">Hán Việt:</dt><dd className="font-bold">{detail.sinoViet}</dd></div>}
        {detail.hskLevel != null && <div><dd className="rounded-full border-2 border-ink/30 bg-surface-container px-2 text-label-md font-bold">{hskLabel(detail.hskLevel)}</dd></div>}
      </dl>
      {children}
    </section>
  );
}
