import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { PoolStatus } from "./use-practice-pool";

interface PracticeFrameProps {
  title: string;
  intro: string;
  status: PoolStatus;
  /** Chưa đủ thẻ để chơi: lý do hiển thị cho người dùng. Null = chơi được. */
  blocked: string | null;
  children: React.ReactNode;
}

/** Khung chung của các chế độ luyện tập: tiêu đề, trạng thái tải/lỗi/thiếu thẻ và lối về ôn tập. */
export function PracticeFrame({ title, intro, status, blocked, children }: PracticeFrameProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">{title}</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">{intro}</p>
      <div className="mt-space-md">
        {status === "loading" && <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải thẻ của bạn…</p>}
        {status === "error" && <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được thẻ. Kiểm tra kết nối rồi tải lại trang nhé.</p>}
        {status === "ready" && blocked && (
          <div className="rounded-2xl bg-surface-container-low p-space-lg text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name="style" size={28} /></span>
            <p className="mt-space-md text-body-md text-on-surface-variant">{blocked}</p>
            <Link href="/app" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-medium text-on-primary hover:bg-primary-container">Chọn bài hát để lưu từ</Link>
          </div>
        )}
        {status === "ready" && !blocked && children}
      </div>
    </div>
  );
}
