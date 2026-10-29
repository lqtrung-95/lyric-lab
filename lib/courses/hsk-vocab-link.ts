/** Cấp HSK (1–6) của một khóa `hsk-N`; không phải khóa HSK thì null. */
export function hskLevelOfSlug(slug: string): number | null {
  const m = /^hsk-([1-6])$/.exec(slug);
  return m ? Number(m[1]) : null;
}

/** Đường dẫn trang danh sách từ vựng của khóa (`/tu-vung-hsk/N`); khóa không phải HSK thì null. */
export function hskVocabHref(slug: string): string | null {
  const level = hskLevelOfSlug(slug);
  return level ? `/tu-vung-hsk/${level}` : null;
}
