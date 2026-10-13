import Link from "next/link";

/** Dòng gợi ý nhỏ dưới ô dán link ở trang chủ: lối vào Công cụ cho cả điện thoại (thanh trên của điện thoại không có chỗ cho biểu tượng Công cụ). */
export function ToolsHint() {
  return (
    <p className="mt-3 text-label-md text-on-surface-variant">
      Cần tra pinyin hay âm Hán Việt? <Link href="/cong-cu" className="inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2">Mở Công cụ</Link>
    </p>
  );
}
