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
    keywords: ["pinyin", "phiên âm", "han viet", "chuyen doi"],
  },
  {
    href: "/tu-vung-hsk",
    title: "Từ vựng HSK có âm Hán Việt",
    description: "Danh sách từ HSK 1–6 kèm pinyin, âm Hán Việt và nghĩa. Tìm nhanh, tải CSV để nạp vào Anki, hoặc in thành bảng A4 có ô tích.",
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
  {
    href: "/gian-the-phon-the",
    title: "Giản thể ⇄ Phồn thể",
    description: "Chuyển chữ Hán giữa giản thể và phồn thể (chuẩn, Đài Loan, Hồng Kông), có đánh dấu chữ cần đọc lại.",
    icon: "translate",
    category: "writing",
    keywords: ["gian the", "phon the", "traditional", "simplified", "dai loan", "hong kong"],
  },
  {
    href: "/giay-tap-viet-chu-han",
    title: "Giấy tập viết chữ Hán in được",
    description: "In giấy 田字格, 米字格, ô vuông trơn và giấy pinyin bốn dòng khổ A4. Chọn cỡ ô, lề, màu rồi in hoặc lưu PDF.",
    icon: "edit",
    category: "writing",
    keywords: ["tap viet", "o vuong", "dien tu cach", "mi tu cach", "in", "pdf", "giay"],
  },
  {
    href: "/luong-tu-tieng-trung",
    title: "Tra lượng từ tiếng Trung",
    description: "Nhập danh từ để biết dùng lượng từ nào (书 → 本, 鱼 → 条), kèm bảng 15 lượng từ thông dụng bằng tiếng Việt.",
    icon: "quiz",
    category: "sentences",
    keywords: ["luong tu", "measure word", "classifier", "dem", "con", "cai"],
  },
  {
    href: "/bien-dieu-thanh-dieu",
    title: "Biến điệu thanh điệu (3-3, 不, 一)",
    description: "Gõ cụm từ để xem chữ nào đổi thanh khi nói: 你好 đọc ní hǎo, 不是 đọc bú shì, 一个 đọc yí gè.",
    icon: "graphic_eq",
    category: "pronunciation",
    keywords: ["bien dieu", "tone sandhi", "thanh 3", "bu", "yi", "quy tac"],
  },
  {
    href: "/to-tap-viet-chu-han",
    title: "Tạo tờ tập viết chữ Hán",
    description: "Nhập chữ Hán, nhận tờ tập viết A4 có chữ mẫu, ô mờ để tô theo, pinyin và âm Hán Việt. In hoặc lưu PDF.",
    icon: "history_edu",
    category: "writing",
    popular: true,
    keywords: ["to tap viet", "worksheet", "tap viet", "tracing", "in", "pdf", "luyen viet"],
  },
  {
    href: "/pinyin-sang-chu-han",
    title: "Pinyin sang chữ Hán",
    description: "Gõ pinyin (có hoặc không dấu thanh) để tìm đúng chữ Hán, kèm âm Hán Việt, nghĩa và cấp HSK.",
    icon: "translate",
    category: "pronunciation",
    keywords: ["pinyin to chinese", "go pinyin", "tim chu han", "nihao", "danh may"],
  },
  {
    href: "/cac-thu-trong-tuan-tieng-trung",
    title: "Các thứ trong tuần tiếng Trung",
    description: "Nghe 7 thứ trong tuần (星期一 là Thứ Hai), học cách hỏi và hẹn theo ngày, thử quiz 1 phút.",
    icon: "calendar_month",
    category: "everyday",
    keywords: ["thu hai", "thu ba", "xingqi", "tuan", "weekday", "chu nhat"],
  },
  {
    href: "/thang-ngay-tieng-trung",
    title: "Tháng và ngày tháng tiếng Trung",
    description: "Nghe 12 tháng và chọn một ngày bất kỳ để xem cách nói năm, tháng, ngày, thứ bằng tiếng Trung.",
    icon: "event",
    category: "everyday",
    keywords: ["thang", "ngay thang", "nam", "date", "month", "yuehao"],
  },
  {
    href: "/cam-on-tieng-trung",
    title: "Cảm ơn trong tiếng Trung",
    description: "谢谢 và 10 cách nói cảm ơn khác, cách đáp lại (不客气…), có nghe, nghĩa tiếng Việt và quiz.",
    icon: "favorite",
    category: "everyday",
    keywords: ["cam on", "xie xie", "thank you", "bu keqi", "dap lai"],
  },
  {
    href: "/xin-loi-tieng-trung",
    title: "Xin lỗi trong tiếng Trung",
    description: "So sánh 对不起, 不好意思 và 抱歉, thêm câu xin lỗi, cách đáp lại, có nghe và quiz.",
    icon: "sentiment_dissatisfied",
    category: "everyday",
    keywords: ["xin loi", "dui bu qi", "sorry", "bu hao yi si", "bao qian"],
  },
  {
    href: "/kiem-tra-ngu-phap-tieng-trung",
    title: "Kiểm tra ngữ pháp tiếng Trung bằng AI",
    description: "Dán một câu tiếng Trung để AI cho biết đúng hay sai, câu sửa ít nhất, cách nói tự nhiên và giải thích bằng tiếng Việt.",
    icon: "auto_awesome",
    category: "sentences",
    popular: true,
    keywords: ["ngu phap", "grammar", "sua cau", "ai", "kiem tra cau", "check"],
  },
  {
    href: "/cau-vi-du-tieng-trung",
    title: "Câu ví dụ tiếng Trung",
    description: "Nhập một từ để xem câu thật từ video, kèm pinyin, nghĩa tiếng Việt, giọng đọc và mở video đúng chỗ.",
    icon: "format_quote",
    category: "sentences",
    keywords: ["cau vi du", "example sentences", "dat cau", "mau cau", "cach dung tu"],
  },
];
