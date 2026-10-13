import type { IconName } from "@/components/ui/icon-names";

export interface ToolEntry {
  /** Đường dẫn của trang công cụ (đặt theo từ khóa tìm kiếm, đừng đổi sau khi đã được lập chỉ mục). */
  href: string;
  title: string;
  description: string;
  icon: IconName;
}

/**
 * Danh sách công cụ công khai (không cần tài khoản hay dữ liệu học). Trang mục lục `/cong-cu`, sitemap và chân trang đều đọc từ đây:
 * thêm công cụ mới = thêm một mục ở đây cộng với trang của nó. Việc cần thẻ đã lưu hay tiến độ học thì thuộc mục Ôn tập, không phải Công cụ.
 */
export const TOOLS: readonly ToolEntry[] = [
  {
    href: "/chu-han-sang-pinyin",
    title: "Chữ Hán sang pinyin và Hán Việt",
    description: "Dán đoạn chữ Hán (giản thể hoặc phồn thể), nhận pinyin có dấu thanh và âm Hán Việt từng từ, sao chép được.",
    icon: "dictionary",
  },
  {
    href: "/tu-vung-hsk",
    title: "Từ vựng HSK có âm Hán Việt",
    description: "Danh sách từ HSK 1–6 kèm pinyin, âm Hán Việt và nghĩa. Tìm nhanh, tải CSV để nạp vào Anki.",
    icon: "list_alt",
  },
];
