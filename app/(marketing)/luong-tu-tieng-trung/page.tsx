import { MeasureWordFinder } from "@/components/tools/measure-word-finder";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/luong-tu-tieng-trung";
const TITLE = "Tra lượng từ tiếng Trung (个, 本, 张, 条…) miễn phí | SongHanzi";
const DESCRIPTION = "Nhập danh từ tiếng Trung để biết dùng lượng từ nào (书 → 本, 鱼 → 条). Kèm bảng 15 lượng từ thông dụng giải thích bằng tiếng Việt. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Lượng từ tiếng Trung là gì?", a: "Là từ đứng giữa số từ và danh từ khi đếm, tương tự \"con, cái, chiếc, quyển\" trong tiếng Việt: 一本书 (một quyển sách), 三只猫 (ba con mèo)." },
  { q: "Không nhớ lượng từ thì dùng gì?", a: "Dùng 个 (gè). Đây là lượng từ phổ thông nhất, người bản xứ vẫn hiểu, dù với nhiều danh từ sẽ nghe kém tự nhiên hơn lượng từ riêng." },
  { q: "Dữ liệu lượng từ lấy từ đâu?", a: "Từ từ điển CC-CEDICT (mục CL của từng từ). Một số từ không ghi lượng từ riêng; khi đó công cụ báo rõ thay vì đoán." },
  { q: "Vì sao có từ nhiều lượng từ?", a: "Cùng một danh từ có thể đi với nhiều lượng từ tùy sắc thái hoặc cách nhìn. Ví dụ 一个人 và 一位老师 (位 lịch sự hơn)." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): tra lượng từ tiếng Trung. */
export default function MeasureWordsPage() {
  return (
    <ToolPage href={HREF} name="Tra lượng từ tiếng Trung" description={DESCRIPTION} h1="Tra lượng từ tiếng Trung" intro="Nhập danh từ để biết lượng từ đi kèm, rồi xem bảng lượng từ thông dụng có ví dụ." faq={FAQ} wide>
      <MeasureWordFinder />
    </ToolPage>
  );
}
