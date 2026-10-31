"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { ChatNavLink } from "@/components/chat/chat-nav-link";
import { AvatarMenu } from "./avatar-menu";
import { HeaderSearch } from "./header-search";
import { HeaderOverflowMenu } from "./header-overflow-menu";
import { useSidebarCollapsed } from "./use-sidebar-collapsed";
import { HudChips } from "./hud-chips";
import { ThemeToggle } from "./theme-toggle";

/**
 * Thanh trên của khung ứng dụng (`<header>`): điện thoại có logo, chỉ số HUD, Cộng đồng, Menu; từ md thanh bên trái đã có logo và điều hướng nên thanh trên chỉ còn HUD và tiện ích
 * (đổi giao diện sáng/tối và hồ sơ hiện từ lg, dưới lg nằm trong bảng Menu).
 */
export function HudBar() {
  const { collapsed } = useSidebarCollapsed();
  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b-2 border-outline-variant bg-surface/95 pt-safe backdrop-blur-md md:left-20 ${collapsed ? "" : "lg:left-64"}`}>
      <div className="flex h-16 items-center justify-between gap-3 px-gutter md:px-6">
        <Link href="/app" aria-label="SongHanzi, về Hôm nay" className="flex min-h-11 items-center gap-2 md:hidden">
          <LogoMark size={32} />
          <span className="text-headline-md font-extrabold tracking-tight text-on-surface max-[480px]:hidden">Song<span className="text-primary">Hanzi</span></span>
        </Link>
        <HeaderSearch />
        <div className="flex items-center gap-1.5 md:ml-auto">
          <HudChips />
          <ChatNavLink />
          <HeaderOverflowMenu hideFrom="lg" />
          <span className="hidden lg:inline-flex"><ThemeToggle /></span>
          <AvatarMenu />
        </div>
      </div>
    </header>
  );
}
