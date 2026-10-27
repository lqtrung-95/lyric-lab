import { MiniQuiz } from "@/components/tools/everyday/mini-quiz";
import { PhraseGroups } from "@/components/tools/everyday/phrase-groups";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";
import { THANKS_GROUPS, THANKS_QUIZ } from "@/lib/tools/everyday/thanks-data";

const HREF = "/cam-on-tieng-trung";
const TITLE = "Cảm ơn trong tiếng Trung: 谢谢 và 10 cách nói khác, cách đáp lại | SongHanzi";
const DESCRIPTION = "Học cách nói cảm ơn bằng tiếng Trung từ 谢谢 đến 感激不尽, cách đáp lại (不客气, 不用谢…), có phát âm, pinyin, nghĩa tiếng Việt và quiz. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Cảm ơn bằng tiếng Trung nói thế nào?", a: "谢谢 (xièxie) dùng được mọi lúc. Trang trọng hơn thì 非常感谢 hoặc 感谢您, thân mật thì 谢谢你." },
  { q: "Đáp lại lời cảm ơn thế nào?", a: "不客气 (bú kèqi) là câu thông dụng nhất. Còn có 不用谢, 别客气, 没事, 应该的." },
  { q: "辛苦了 có phải cảm ơn không?", a: "Gần như vậy: nghĩa là \"bạn vất vả rồi\", dùng để cảm ơn người vừa làm việc giúp bạn, rất hay gặp ở công sở." },
  { q: "Khi nào dùng 您 thay cho 你?", a: "Khi nói với người lớn tuổi, cấp trên hoặc khách: 谢谢您, 感谢您的帮助." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): cảm ơn và đáp lại bằng tiếng Trung. */
export default function ThanksPage() {
  return (
    <ToolPage href={HREF} name="Cảm ơn trong tiếng Trung" description={DESCRIPTION} h1="Cảm ơn trong tiếng Trung" intro="Nghe 谢谢 và các cách nói cảm ơn khác, học cách đáp lại, rồi thử quiz ngắn." faq={FAQ} wide>
      <div className="space-y-space-lg">
        <PhraseGroups groups={THANKS_GROUPS} />
        <MiniQuiz title="Quiz: cảm ơn và đáp lại" questions={THANKS_QUIZ} />
      </div>
    </ToolPage>
  );
}
