import { ExampleSentenceFinder } from "@/components/tools/example-sentence-finder";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/cau-vi-du-tieng-trung";
const TITLE = "Câu ví dụ tiếng Trung thật có pinyin, nghĩa tiếng Việt và giọng đọc | SongHanzi";
const DESCRIPTION = "Nhập một từ tiếng Trung để xem câu ví dụ thật từ video, kèm pinyin, nghĩa tiếng Việt, nghe phát âm và mở video đúng chỗ câu đó. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "Câu ví dụ lấy từ đâu?", a: "Từ lời thoại của các video tiếng Trung đã được duyệt trên SongHanzi, nên là câu người bản ngữ nói thật. Mỗi câu kèm nghĩa tiếng Việt và pinyin, và bạn mở được video gốc đúng chỗ." },
  { q: "Vì sao có từ không ra câu nào?", a: "Hiện chỉ có câu cho các từ HSK thông dụng có mặt trong video đã duyệt. Từ hiếm hoặc từ chuyên ngành có thể chưa có; kho câu lớn dần khi có thêm video." },
  { q: "Tìm bằng pinyin hay tiếng Việt được không?", a: "Công cụ này tìm theo chữ Hán. Nếu chỉ biết pinyin, dùng công cụ Pinyin sang chữ Hán để tìm chữ trước." },
  { q: "Câu ví dụ giúp ích thế nào?", a: "Xem từ trong câu thật giúp bạn hiểu cách dùng, từ đi kèm và ngữ điệu tốt hơn nhiều so với chỉ học nghĩa đơn lẻ." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): câu ví dụ thật cho một từ tiếng Trung. */
export default function ExampleSentencesPage() {
  return (
    <ToolPage href={HREF} name="Câu ví dụ tiếng Trung" description={DESCRIPTION} h1="Câu ví dụ tiếng Trung" intro="Nhập một từ để xem câu người bản ngữ nói thật, có pinyin, nghĩa tiếng Việt và giọng đọc." faq={FAQ} wide>
      <ExampleSentenceFinder />
    </ToolPage>
  );
}
