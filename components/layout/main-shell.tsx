"use client";

import { useSidebarCollapsed } from "./use-sidebar-collapsed";

/** Khung nội dung chính: chừa chỗ cho thanh bên (rộng khi mở, hẹp khi thu gọn từ lg). */
export function MainShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebarCollapsed();
  return <div className={`md:pl-20 ${collapsed ? "" : "lg:pl-64"}`}>{children}</div>;
}
