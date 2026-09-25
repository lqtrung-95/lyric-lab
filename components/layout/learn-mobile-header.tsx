"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/icon";

/** Thanh trên của màn học trên điện thoại: chỉ có nút quay lại và tiêu đề (S4, S5 ẩn tab bar để tập trung). */
export function LearnMobileHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-surface/85 pt-safe shadow-[0_1px_8px_rgba(30,26,22,0.03)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center gap-1 px-gutter">
        <button type="button" aria-label="Quay lại" onClick={() => router.back()}
          className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface active:bg-surface-container-high">
          <Icon name="arrow_back" size={22} />
        </button>
        <h1 className="font-serif text-headline-md text-on-surface">{title}</h1>
      </div>
    </header>
  );
}
