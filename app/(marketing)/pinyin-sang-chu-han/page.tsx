import { PinyinToHanFinder } from "@/components/tools/pinyin-to-han-finder";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/pinyin-sang-chu-han";
const TITLE = "Pinyin sang chữ Hán: gõ pinyin tìm đúng chữ cần viết (miễn phí) | SongHanzi";
const DESCRIPTION = "Gõ pinyin có hoặc không dấu thanh (nihao, ni3 hao3) để tìm chữ Hán tương ứng, kèm âm Hán Việt, nghĩa và cấp HSK. Miễn phí, không cần đăng ký.";

const FAQ: ToolFaq[] = [
  { q: "Tôi chỉ nhớ cách đọc, làm sao tìm chữ Hán?", a: "Gõ pinyin vào ô tìm, có thể không dấu (nihao), dùng số thanh (ni3 hao3) hoặc dấu (nǐ hǎo). Công cụ liệt kê các từ đọc như vậy kèm nghĩa để bạn chọn đúng chữ." },
  { q: "Gõ thanh điệu thì có chính xác hơn không?", a: "Có. Khi bạn gõ thanh (số 1–5 hoặc dấu), kết quả chỉ giữ từ đúng thanh đó. Không gõ thanh thì hiện mọi từ cùng âm, xếp từ thông dụng lên trước." },
  { q: "Chữ ü gõ thế nào?", a: "Gõ v hoặc ü đều được, ví dụ lv (lǜ) hoặc nv (nǚ)." },
  { q: "Vì sao một pinyin ra nhiều chữ?", a: "Tiếng Trung có rất nhiều chữ đồng âm (shì có 是, 事, 市, 试…). Hãy xem nghĩa và âm Hán Việt để chọn chữ đúng với điều bạn muốn nói." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): tìm chữ Hán từ pinyin. */
export default function PinyinToHanPage() {
  return (
    <ToolPage href={HREF} name="Pinyin sang chữ Hán" description={DESCRIPTION} h1="Pinyin sang chữ Hán" intro="Gõ pinyin để tìm chữ Hán bạn muốn, có âm Hán Việt và nghĩa để chọn đúng chữ." faq={FAQ} wide>
      <PinyinToHanFinder />
    </ToolPage>
  );
}
