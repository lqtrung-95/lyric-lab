import { ToneSandhiChecker } from "@/components/tools/tone-sandhi-checker";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/bien-dieu-thanh-dieu";
const TITLE = "Biến điệu thanh điệu tiếng Trung: quy tắc 3-3, 不, 一 | SongHanzi";
const DESCRIPTION = "Gõ một cụm tiếng Trung để biết thanh nào đổi khi nói: hai thanh 3 liền nhau (你好 đọc ní hǎo), 不 (bú), 一 (yí, yì). Có nghe và giải thích bằng tiếng Việt.";

const FAQ: ToolFaq[] = [
  { q: "Biến điệu thanh điệu là gì?", a: "Là hiện tượng một số thanh đổi cách đọc khi đứng cạnh thanh khác để dễ nói hơn. Chữ viết và pinyin trong từ điển vẫn giữ thanh gốc, chỉ khi nói mới đổi." },
  { q: "Quy tắc hai thanh 3 là gì?", a: "Khi hai thanh 3 đứng liền nhau, chữ đầu đọc thành thanh 2. Ví dụ 你好 (nǐ hǎo) đọc là ní hǎo. Với ba thanh 3 liền như 我很好, hai chữ đầu đều đọc thanh 2: wó hén hǎo." },
  { q: "不 đổi thanh khi nào?", a: "不 vốn là bù (thanh 4). Đứng trước một chữ thanh 4 thì đọc bú (thanh 2), như 不是 (bú shì). Trước thanh 1, 2, 3 vẫn đọc bù: 不好 (bù hǎo)." },
  { q: "一 đọc thế nào?", a: "一 vốn là yī (thanh 1). Trước thanh 4 đọc yí (一个 yí gè); trước thanh 1, 2, 3 đọc yì (一天 yì tiān). Khi là số thứ tự, đứng riêng hoặc ở cuối (第一, 一月) vẫn đọc yī." },
  { q: "Vì sao pinyin trên sách không ghi biến điệu?", a: "Quy ước là ghi thanh gốc của từng chữ. Người học tự áp quy tắc biến điệu khi nói, công cụ này giúp bạn kiểm tra nhanh." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): kiểm tra biến điệu thanh điệu. */
export default function ToneSandhiPage() {
  return (
    <ToolPage href={HREF} name="Kiểm tra biến điệu thanh điệu" description={DESCRIPTION} h1="Biến điệu thanh điệu tiếng Trung" intro="Gõ một cụm từ hoặc câu, xem chữ nào đổi thanh khi nói và vì sao." faq={FAQ}>
      <ToneSandhiChecker />
    </ToolPage>
  );
}
