import { MiniQuiz } from "@/components/tools/everyday/mini-quiz";
import { PhraseGroups } from "@/components/tools/everyday/phrase-groups";
import { WeekdayGrid } from "@/components/tools/everyday/weekday-grid";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { DAY_GROUPS, DAY_QUIZ } from "@/lib/tools/everyday/days-data";

const HREF = "/cac-thu-trong-tuan-tieng-trung";
const TITLE = "Các thứ trong tuần tiếng Trung: 星期一 đến 星期天, có nghe và quiz | SongHanzi";
const DESCRIPTION = "Học 7 thứ trong tuần bằng tiếng Trung (星期一 là Thứ Hai), nghe phát âm, mẫu câu hỏi và hẹn theo ngày, kèm quiz 1 phút. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Vì sao 星期一 là Thứ Hai chứ không phải Thứ Nhất?", a: "Tiếng Trung đếm thứ từ 星期一 (nhất) là ngày đầu tuần, còn tiếng Việt gọi ngày đầu tuần là Thứ Hai. Nên số bị lệch một: 星期三 là Thứ Tư, 星期五 là Thứ Sáu." },
  { q: "Chủ Nhật nói thế nào?", a: "星期日 (xīngqīrì) khi viết, 星期天 (xīngqītiān) khi nói. Không có 星期七." },
  { q: "星期, 周 và 礼拜 khác nhau ra sao?", a: "Cùng nghĩa là tuần. 星期 phổ biến nhất, 周 ngắn gọn hơn (hay gặp trong lịch và văn viết), 礼拜 là khẩu ngữ ở một số vùng." },
  { q: "Hỏi hôm nay thứ mấy thế nào?", a: "今天星期几? (Jīntiān xīngqī jǐ?). Trả lời: 今天星期三. Không cần thêm động từ 是." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): các thứ trong tuần bằng tiếng Trung. */
export default function WeekdaysPage() {
  return (
    <ToolPage href={HREF} name="Các thứ trong tuần tiếng Trung" description={DESCRIPTION} h1="Các thứ trong tuần tiếng Trung" intro="Nghe đủ bảy thứ, học cách hỏi và hẹn theo ngày, rồi thử quiz 1 phút." faq={FAQ} wide>
      <div className="space-y-space-lg">
        <WeekdayGrid />
        <PhraseGroups groups={DAY_GROUPS} />
        <MiniQuiz title="Quiz 1 phút: các thứ trong tuần" questions={DAY_QUIZ} />
      </div>
    </ToolPage>
  );
}
