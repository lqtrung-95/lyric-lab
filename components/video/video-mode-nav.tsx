import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

export type VideoMode = "watch" | "dictation" | "shadowing";

// `short` là nhãn gọn cho điện thoại để ba nút nằm vừa một hàng; tên truy cập luôn là nhãn đầy đủ.
const MODES: { id: VideoMode; label: string; short: string; icon: IconName; path: string }[] = [
  { id: "watch", label: "Xem video", short: "Xem", icon: "smart_display", path: "" },
  { id: "dictation", label: "Chép chính tả", short: "Chép", icon: "edit", path: "/dictation" },
  { id: "shadowing", label: "Luyện nói", short: "Nói", icon: "mic", path: "/shadowing" },
];

/** Chuyển giữa ba cách học một video (xem, chép chính tả, luyện nói); đặt ở bên phải thanh tiêu đề của cả ba màn để luôn đủ đầy và nhất quán. */
export function VideoModeNav({ videoId, current }: { videoId: string; current: VideoMode }) {
  return (
    <nav aria-label="Cách học video này" className="flex flex-wrap gap-1">
      {MODES.map((m) => (
        <Link
          key={m.id} href={`/video/${videoId}${m.path}`} aria-current={m.id === current ? "page" : undefined}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 sm:px-4 text-label-md font-semibold transition-colors ${
            m.id === current ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
          }`}
        >
          <Icon name={m.icon} size={18} />
          <span aria-hidden="true" className="sm:hidden">{m.short}</span>
          <span className="hidden sm:inline">{m.label}</span>
          <span className="sr-only sm:hidden">{m.label}</span>
        </Link>
      ))}
    </nav>
  );
}
