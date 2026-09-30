import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";

/** Chân trang giới thiệu: logo, lối vào app và lưu ý bản quyền. */
export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t border-outline-variant/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-gutter py-12 md:flex-row md:items-start md:justify-between md:px-6 lg:px-12">
        <div>
          <div className="flex items-center gap-2">
            <LogoMark size={28} />
            <span className="font-serif text-headline-md font-semibold text-on-surface">Song<span className="text-primary">Hanzi</span></span>
          </div>
          <p className="mt-2 max-w-sm text-label-md text-on-surface-variant">Học tiếng Trung qua bài hát, dành cho người Việt.</p>
        </div>
        <nav aria-label="Liên kết cuối trang" className="flex flex-wrap gap-x-6 gap-y-2 text-label-md">
          <Link href="/app" className="inline-flex min-h-11 items-center text-primary hover:underline">Mở app</Link>
          <a href="#faq" className="inline-flex min-h-11 items-center text-on-surface-variant hover:text-on-surface">Hỏi đáp</a>
          <a href="#top" className="inline-flex min-h-11 items-center text-on-surface-variant hover:text-on-surface">Lên đầu trang</a>
        </nav>
      </div>
      <p className="mx-auto max-w-7xl px-gutter pb-2 text-label-md text-on-surface-variant md:px-6 lg:px-12">
        SongHanzi không tải hay lưu nhạc. Video phát trực tiếp từ YouTube; lời bài hát thuộc về chủ sở hữu quyền tác giả và chỉ hiện cạnh video gốc để học tập.
      </p>
      <p className="mx-auto max-w-7xl px-gutter pb-10 text-label-md text-on-surface-variant md:px-6 lg:px-12">
        Chủ sở hữu quyền tác giả muốn yêu cầu gỡ nội dung: gửi qua trang{" "}
        <Link href="/feedback" className="text-primary hover:underline">Góp ý</Link>, chọn mục &quot;Yêu cầu gỡ nội dung (bản quyền)&quot;. Chúng tôi phản hồi trong 72 giờ.
      </p>
    </footer>
  );
}
