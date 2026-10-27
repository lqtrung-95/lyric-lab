import { DateSayer } from "@/components/tools/everyday/date-sayer";
import { MiniQuiz } from "@/components/tools/everyday/mini-quiz";
import { PhraseGroups } from "@/components/tools/everyday/phrase-groups";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { DATE_PHRASES, DATE_QUIZ } from "@/lib/tools/everyday/months-dates";

const HREF = "/thang-ngay-tieng-trung";
const TITLE = "Tháng và ngày tháng trong tiếng Trung: cách nói ngày bất kỳ, có nghe | SongHanzi";
const DESCRIPTION = "Học 12 tháng (一月 đến 十二月), cách đọc năm, tháng, ngày bằng tiếng Trung và chọn một ngày bất kỳ để nghe cách nói. Có mẫu câu và quiz. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Nói ngày tháng bằng tiếng Trung theo thứ tự nào?", a: "Từ lớn đến nhỏ: năm, tháng, ngày, rồi đến thứ và giờ. Ví dụ 2026年10月28日 星期三 (ngày 28 tháng 10 năm 2026, thứ Tư)." },
  { q: "Năm đọc thế nào?", a: "Đọc từng chữ số: 2026 là 二零二六年 (èr líng èr liù nián), không đọc là hai nghìn không trăm hai mươi sáu." },
  { q: "号 và 日 khác nhau thế nào?", a: "Cùng chỉ ngày. 号 (hào) dùng khi nói, 日 (rì) dùng trong văn viết và thông báo trang trọng." },
  { q: "Hỏi hôm nay ngày mấy?", a: "今天几号? (Jīntiān jǐ hào?) hoặc hỏi cả tháng: 今天几月几号?" },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): tháng và ngày tháng bằng tiếng Trung. */
export default function MonthsDatesPage() {
  return (
    <ToolPage href={HREF} name="Tháng và ngày tháng tiếng Trung" description={DESCRIPTION} h1="Tháng và ngày tháng trong tiếng Trung" intro="Nghe 12 tháng, chọn một ngày bất kỳ để xem cách nói, rồi luyện mẫu câu và quiz." faq={FAQ} wide>
      <div className="space-y-space-lg">
        <DateSayer />
        <PhraseGroups groups={[{ id: "date-phrases", title: "Mẫu câu về ngày tháng", phrases: DATE_PHRASES }]} />
        <MiniQuiz title="Quiz 1 phút: tháng và ngày" questions={DATE_QUIZ} />
      </div>
    </ToolPage>
  );
}
