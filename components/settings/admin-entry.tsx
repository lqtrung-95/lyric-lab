"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { AdminReportsBadge } from "@/components/admin/admin-reports-badge";
import { useIsAdmin } from "@/components/library/use-is-admin";

/** Lối vào khu quản trị, chỉ hiện khi whoami server xác nhận tài khoản là admin (không phải kiểm tra thật, chỉ để ẩn/hiện giao diện). */
export function AdminEntry() {
  const isAdmin = useIsAdmin();
  if (!isAdmin) return null;
  return (
    <Link
      href="/admin"
      className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-space-md text-body-md text-on-surface shadow-sm hover:bg-surface-container-low"
    >
      <span className="flex items-center gap-2"><Icon name="verified" size={20} className="text-primary" />Quản trị<AdminReportsBadge /></span>
      <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
    </Link>
  );
}
