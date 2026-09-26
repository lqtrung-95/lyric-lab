import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";
import type { AnalysisErrorCode } from "@/lib/analysis/analysis-error-codes";

interface ErrorCopy {
  icon: IconName;
  title: string;
  body: string;
  retry: boolean;
}

// Mỗi lỗi: một câu giải thích và một hành động (design-brief S3, IN-05).
const COPY: Record<AnalysisErrorCode, ErrorCopy> = {
  no_lyrics: {
    icon: "subtitles",
    title: "Chưa tìm được lời cho bài này",
    body: "Video này chưa có lời đồng bộ. Hãy thử tìm bản “lyrics video” của cùng bài hát trên YouTube rồi dán lại link.",
    retry: false,
  },
  video_not_found: {
    icon: "warning",
    title: "Không tìm thấy video",
    body: "Video có thể đã bị xóa hoặc để chế độ riêng tư. Hãy kiểm tra lại link.",
    retry: false,
  },
  invalid_video: { icon: "warning", title: "Link chưa đúng", body: "Hãy dán link video YouTube.", retry: false },
  rate_limited: {
    icon: "hourglass_top",
    title: "Bạn đã phân tích nhiều bài trong hôm nay",
    body: "Mỗi ngày có giới hạn số bài mới để giữ dịch vụ miễn phí. Bài đã học vẫn mở được bình thường, mai bạn thử lại nhé.",
    retry: false,
  },
  auth_required: {
    icon: "warning",
    title: "Chưa mở được phiên học",
    body: "Trình duyệt chưa tạo được phiên làm việc. Hãy kiểm tra kết nối (và cho phép cookie) rồi thử lại.",
    retry: true,
  },
  analysis_failed: {
    icon: "warning",
    title: "Phân tích chưa thành công",
    body: "Hệ thống gặp trục trặc khi phân tích bài này. Bạn thử lại sau ít phút nhé.",
    retry: true,
  },
  server_error: {
    icon: "warning",
    title: "Có lỗi xảy ra",
    body: "Không kết nối được tới máy chủ. Bạn thử lại sau ít phút nhé.",
    retry: true,
  },
};

export function AnalysisErrorView({ code, onRetry }: { code: AnalysisErrorCode; onRetry: () => void }) {
  const copy = COPY[code];
  return (
    <div role="alert" className="mt-space-lg rounded-2xl bg-surface-container-low p-space-lg text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-high text-primary">
        <Icon name={copy.icon} size={28} />
      </span>
      <h2 className="mt-space-md font-serif text-headline-md text-on-surface">{copy.title}</h2>
      <p className="mx-auto mt-space-sm max-w-md text-body-md text-on-surface-variant">{copy.body}</p>
      <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
        {copy.retry && (
          <button
            type="button"
            onClick={onRetry}
            className="min-h-11 rounded-full bg-primary-container px-6 text-label-md font-semibold text-on-primary-container"
          >
            Thử lại
          </button>
        )}
        <Link
          href="/app"
          className="flex min-h-11 items-center rounded-full bg-surface-container-high px-6 text-label-md font-medium text-on-surface"
        >
          Dán link khác
        </Link>
      </div>
    </div>
  );
}
