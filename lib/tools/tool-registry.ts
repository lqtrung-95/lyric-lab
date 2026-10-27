import type { IconName } from "@/components/ui/icon-names";

export type ToolCategory = "writing" | "pronunciation" | "sentences" | "everyday" | "hsk";

export const TOOL_CATEGORIES: readonly { id: ToolCategory; label: string }[] = [
  { id: "writing", label: "Viết chữ" },
  { id: "pronunciation", label: "Phát âm" },
  { id: "sentences", label: "Câu và ngữ pháp" },
  { id: "everyday", label: "Tiếng Trung hằng ngày" },
  { id: "hsk", label: "HSK và trình độ" },
];

export interface ToolEntry {
  /** Đường dẫn của trang công cụ (đặt theo từ khóa tìm kiếm, đừng đổi sau khi đã được lập chỉ mục). */
  href: string;
  title: string;
  description: string;
  icon: IconName;
  category: ToolCategory;
  /** Hiện ở hàng "Dùng nhiều nhất" đầu trang. */
  popular?: boolean;
  /** Từ khóa phụ cho ô tìm (không dấu cũng khớp), ngoài tên và mô tả. */
  keywords?: string[];
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
    category: "pronunciation",
    popular: true,
    keywords: ["pinyin", "phiên âm", "han viet", "chuyen doi"],
  },
  {
    href: "/tu-vung-hsk",
    title: "Từ vựng HSK có âm Hán Việt",
    description: "Danh sách từ HSK 1–6 kèm pinyin, âm Hán Việt và nghĩa. Tìm nhanh, tải CSV để nạp vào Anki.",
    icon: "list_alt",
    category: "hsk",
    keywords: ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6", "anki", "csv", "tu vung"],
  },
  {
    href: "/phat-am",
    title: "Luyện phát âm tiếng Trung",
    description: "Bảng pinyin có giọng đọc, luyện thanh điệu có chấm cao độ giọng bạn và trò nghe đoán thanh.",
    icon: "mic",
    category: "pronunciation",
    popular: true,
    keywords: ["thanh dieu", "bang pinyin", "tone", "phat am"],
  },
];
