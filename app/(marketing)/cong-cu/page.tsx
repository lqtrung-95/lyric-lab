import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SITE_URL } from "@/lib/seo/site-url";
import { TOOLS } from "@/lib/tools/tool-registry";

const TITLE = "Công cụ học tiếng Trung miễn phí | SongHanzi";
const DESCRIPTION = "Các công cụ nhỏ cho người Việt học tiếng Trung: chuyển chữ Hán sang pinyin và âm Hán Việt. Miễn phí, không cần đăng ký.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/cong-cu" },
  openGraph: { type: "website", locale: "vi_VN", siteName: "SongHanzi", title: TITLE, description: DESCRIPTION, url: "/cong-cu" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const jsonLd = {
  "@context": "https://schema.org", "@type": "CollectionPage", name: "Công cụ học tiếng Trung", url: `${SITE_URL}/cong-cu`, description: DESCRIPTION, inLanguage: "vi",
  hasPart: TOOLS.map((t) => ({ "@type": "WebApplication", name: t.title, url: `${SITE_URL}${t.href}`, description: t.description })),
};

/** Mục lục các công cụ công khai (đọc từ `TOOLS`). Trang được lập chỉ mục và liên kết nội bộ tới từng công cụ. */
export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-space-lg pb-space-lg">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Công cụ</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">Những công cụ nhỏ dùng được ngay, không cần đăng ký hay lưu thẻ học.</p>
      </header>
      <ul className="grid gap-gutter sm:grid-cols-2">
        {TOOLS.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="flex h-full min-h-28 flex-col gap-2 rounded-2xl bg-surface-container-low p-space-md transition-colors hover:bg-surface-container-high">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name={t.icon} size={22} /></span>
              <span className="text-body-lg font-semibold text-on-surface">{t.title}</span>
              <span className="text-label-md text-on-surface-variant">{t.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
