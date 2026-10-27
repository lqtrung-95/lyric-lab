import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { WorksheetGenerator } from "@/components/tools/worksheet-generator";

const HREF = "/to-tap-viet-chu-han";
const TITLE = "Tạo tờ tập viết chữ Hán có pinyin và Hán Việt (in miễn phí) | SongHanzi";
const DESCRIPTION = "Nhập chữ Hán, nhận ngay tờ tập viết A4: mỗi chữ một hàng có chữ mẫu, ô mờ để tô theo và ô trống tự viết, kèm pinyin và âm Hán Việt. In hoặc lưu PDF miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Tờ tập viết gồm những gì?", a: "Mỗi chữ một hàng: ô đầu là chữ mẫu đậm, tiếp theo là vài ô mờ để tô theo, phần còn lại là ô trống để bạn tự viết. Bên trái hàng có pinyin và âm Hán Việt của chữ." },
  { q: "Tôi nhập từ hay câu có được không?", a: "Được. Công cụ tách ra từng chữ Hán khác nhau (bỏ trùng, bỏ dấu câu và chữ Latin), tối đa 60 chữ mỗi lần và tự chia thành nhiều trang A4." },
  { q: "Chữ mẫu dùng kiểu chữ nào?", a: "Kiểu chữ khải (楷体) của thiết bị bạn nếu có, nếu không thì dùng chữ Hán mặc định. Để học thứ tự nét, hãy xem chữ trong Tra từ của SongHanzi (có hoạt họa nét)." },
  { q: "Làm sao để lưu thành PDF?", a: "Bấm In hoặc lưu PDF, trong hộp thoại in chọn máy in là Lưu thành PDF. Mỗi tờ được dựng đúng khổ A4." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): tạo tờ tập viết chữ Hán. */
export default function WorksheetPage() {
  return (
    <ToolPage href={HREF} name="Tờ tập viết chữ Hán" description={DESCRIPTION} h1="Tạo tờ tập viết chữ Hán" intro="Nhập chữ Hán hoặc chọn bộ chữ gợi ý, chỉnh kiểu ô rồi in hoặc lưu PDF." faq={FAQ} wide>
      <WorksheetGenerator />
    </ToolPage>
  );
}
