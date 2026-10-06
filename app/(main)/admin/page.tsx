import type { Metadata } from "next";
import Link from "next/link";
import { AdminGate } from "@/components/admin/admin-gate";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

export const metadata: Metadata = { title: "Quản trị", robots: { index: false } };

const LINKS: { href: string; label: string; description: string; icon: IconName }[] = [
  { href: "/admin/translations", label: "Duyệt bản dịch", description: "Góp ý bản dịch từng câu do người học gửi.", icon: "translate" },
  { href: "/admin/videos", label: "Quản lý video", description: "Duyệt, ẩn, xóa video luyện nghe và sửa bản dịch từng câu.", icon: "smart_display" },
  { href: "/admin/feedback", label: "Duyệt góp ý", description: "Góp ý/báo lỗi chờ hiện công khai ở trang Góp ý.", icon: "feedback" },
];

/** Trang gốc khu quản trị: whoami server xác thực thật qua AdminGate; trang này chỉ liệt kê lối vào. */
export default function AdminHomePage() {
  return (
    <AdminGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-space-md">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Quản trị</h1>
        <ul className="flex flex-col gap-space-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:bg-surface-container-low">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                  <Icon name={l.icon} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body-lg font-medium text-on-surface">{l.label}</span>
                  <span className="block text-label-md text-on-surface-variant">{l.description}</span>
                </span>
                <Icon name="chevron_right" size={20} className="shrink-0 text-on-surface-variant" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AdminGate>
  );
}
