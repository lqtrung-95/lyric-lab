"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/components/library/use-is-admin";

/**
 * Bọc trang admin: chờ whoami xác thực xong (không hiện gì trong lúc chờ, tránh nháy "không phải admin" cho chính
 * admin), rồi hoặc hiện nội dung hoặc chuyển thẳng về trang chủ nếu không phải admin — không hiện thông báo từ chối.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (isAdmin === false) router.replace("/app");
  }, [isAdmin, router]);

  if (isAdmin !== true) return null;
  return <>{children}</>;
}
