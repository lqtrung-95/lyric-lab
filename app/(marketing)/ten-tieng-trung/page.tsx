import { ChineseNameTool } from "@/components/tools/chinese-name-tool";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/ten-tieng-trung";
const TITLE = "Tên tiếng Trung của bạn: đổi tên Việt sang chữ Hán, pinyin | SongHanzi";
const DESCRIPTION = "Nhập tên Việt, nhận tên tiếng Trung gợi ý theo âm Hán Việt (ví dụ Nguyễn → 阮) kèm pinyin, nghĩa từng chữ và thẻ ảnh để khoe. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Tên tiếng Trung của tôi được chọn thế nào?", a: "Họ đổi theo cách viết chuẩn (Nguyễn → 阮, Trần → 陈). Tên gọi và tên đệm chọn một chữ Hán đẹp, nghĩa tốt có âm Hán Việt trùng với âm tên của bạn." },
  { q: "Vì sao tên của tôi chỉ có một cách?", a: "Một âm Hán Việt có thể ứng với nhiều chữ Hán. Đây là gợi ý phổ biến, bạn có thể đổi chữ khác có cùng âm nếu thích nghĩa khác." },
  { q: "Chữ 氏 (Thị) đâu rồi?", a: "Tên đệm Thị của nữ thường không được dịch sang tên tiếng Trung nên công cụ bỏ qua." },
  { q: "Có dùng làm tên chính thức được không?", a: "Nên coi là tên để học và giao tiếp. Dùng tên chính thức (giấy tờ, thương hiệu) thì hãy hỏi thêm người bản ngữ." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): đổi tên Việt sang tên tiếng Trung. */
export default function ChineseNamePage() {
  return (
    <ToolPage href={HREF} name="Tên tiếng Trung của bạn" description={DESCRIPTION} h1="Tên tiếng Trung của bạn" intro="Nhập tên Việt, xem tên chữ Hán gợi ý theo âm Hán Việt, nghe đọc và lưu thẻ ảnh để khoe bạn bè." faq={FAQ}>
      <ChineseNameTool />
    </ToolPage>
  );
}
