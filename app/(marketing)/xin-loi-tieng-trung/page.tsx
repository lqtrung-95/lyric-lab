import { MiniQuiz } from "@/components/tools/everyday/mini-quiz";
import { PhraseGroups } from "@/components/tools/everyday/phrase-groups";
import { SorryCompare } from "@/components/tools/everyday/sorry-compare";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { SORRY_GROUPS, SORRY_QUIZ } from "@/lib/tools/everyday/sorry-data";

const HREF = "/xin-loi-tieng-trung";
const TITLE = "Xin lỗi trong tiếng Trung: 对不起, 不好意思 hay 抱歉? Dùng thế nào | SongHanzi";
const DESCRIPTION = "So sánh 对不起, 不好意思 và 抱歉 khi xin lỗi bằng tiếng Trung, thêm nhiều câu xin lỗi, cách đáp lại (没关系…), có phát âm và quiz. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "对不起 và 不好意思 khác nhau thế nào?", a: "对不起 nhận lỗi thật, nặng hơn. 不好意思 nhẹ, dùng khi ngại hoặc làm phiền chút ít, cũng để mở lời lịch sự (hỏi đường, nhờ vả)." },
  { q: "Khi nào dùng 抱歉?", a: "Trang trọng: văn viết, email, thông báo hoặc khi nói với khách hàng, cấp trên." },
  { q: "Đáp lại lời xin lỗi thế nào?", a: "没关系 (không sao đâu) là phổ biến nhất. Còn 没事, 不要紧, 没问题, 别放在心上." },
  { q: "打扰了 dùng lúc nào?", a: "Khi bước vào chỗ người khác hoặc ngắt lời, nghĩa là xin lỗi vì đã làm phiền." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): xin lỗi và đáp lại bằng tiếng Trung. */
export default function SorryPage() {
  return (
    <ToolPage href={HREF} name="Xin lỗi trong tiếng Trung" description={DESCRIPTION} h1="Xin lỗi trong tiếng Trung" intro="Chọn đúng câu xin lỗi cho đúng tình huống, nghe phát âm và thử quiz ngắn." faq={FAQ} wide>
      <div className="space-y-space-lg">
        <SorryCompare />
        <PhraseGroups groups={SORRY_GROUPS} />
        <MiniQuiz title="Quiz: xin lỗi và đáp lại" questions={SORRY_QUIZ} />
      </div>
    </ToolPage>
  );
}
