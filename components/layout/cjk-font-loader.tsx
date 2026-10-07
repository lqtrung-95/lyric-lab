"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { googleFontsUrl } from "@/lib/ui/google-fonts-url";

const MARK = "data-cjk-font";

/**
 * Nạp font chữ Hán (Noto Serif SC) SAU khi trang đã vẽ và hydrate, không chặn lần vẽ đầu. Stylesheet này nặng (~120 KB, hàng chục mảnh font
 * ~70–100 KB theo unicode-range) và nếu là <link> thường trong <head> thì trình duyệt phải đợi nó mới vẽ được gì, đặc biệt chậm trên mạng di
 * động. Trang giới thiệu "/" bỏ hẳn (chữ Hán ít, dùng font hệ thống trong chuỗi font dự phòng của `--font-serif-stack`); sang trang khác
 * (kể cả điều hướng trong app) thì nạp một lần. Chữ Hán hiện font dự phòng rồi đổi sang Noto khi tải xong (display=swap).
 */
export function CjkFontLoader() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/" || document.querySelector(`link[${MARK}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = googleFontsUrl();
    link.setAttribute(MARK, "");
    document.head.appendChild(link);
  }, [pathname]);
  return null;
}
