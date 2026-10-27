import { GrammarChecker } from "@/components/tools/grammar-checker";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/kiem-tra-ngu-phap-tieng-trung";
const TITLE = "Kiểm tra ngữ pháp tiếng Trung bằng AI: sửa câu, giải thích bằng tiếng Việt | SongHanzi";
const DESCRIPTION = "Dán một câu tiếng Trung để AI kiểm tra: đúng hay sai, câu sửa ít nhất, cách nói tự nhiên của người bản ngữ và giải thích từng lỗi bằng tiếng Việt, kèm pinyin. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Công cụ kiểm tra những gì?", a: "Ngữ pháp và cách dùng từ của một câu tiếng Trung: trật tự từ, trợ từ (了, 过, 的), lượng từ, câu so sánh với 比, phủ định với 不 và 没 và các lỗi thường gặp ở người Việt." },
  { q: "\"Sửa ít nhất\" và \"Cách nói tự nhiên\" khác nhau thế nào?", a: "Sửa ít nhất chỉ đổi đúng chỗ sai, giữ nguyên ý và từ của bạn. Cách nói tự nhiên là câu người bản ngữ thường dùng cho ý đó, có thể đổi nhiều hơn." },
  { q: "AI có thể sai không?", a: "Có. Kết quả do AI tạo nên đôi khi chưa chuẩn hoặc quá khắt khe. Hãy đối chiếu với giáo viên, sách ngữ pháp hoặc Tra từ khi không chắc." },
  { q: "Vì sao có giới hạn lượt dùng?", a: "Mỗi lần kiểm tra tốn chi phí AI nên có giới hạn mỗi ngày: khách chưa đăng nhập tối đa 15 lượt, người đã vào app có thêm lượt theo tài khoản (tài khoản đăng nhập nhiều hơn khách). Cùng một câu hỏi lại trong thời gian ngắn thì dùng kết quả cũ và không tốn lượt." },
  { q: "Câu của tôi có được lưu không?", a: "Không gắn với tài khoản hay danh tính. Câu được gửi tới nhà cung cấp AI để chấm, đừng nhập thông tin cá nhân." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): kiểm tra ngữ pháp tiếng Trung bằng AI. */
export default function GrammarCheckPage() {
  return (
    <ToolPage href={HREF} name="Kiểm tra ngữ pháp tiếng Trung" description={DESCRIPTION} h1="Kiểm tra ngữ pháp tiếng Trung" intro="Nhập một câu bạn đặt, AI cho biết đúng hay sai, cách sửa và giải thích bằng tiếng Việt." faq={FAQ} wide>
      <GrammarChecker />
    </ToolPage>
  );
}
