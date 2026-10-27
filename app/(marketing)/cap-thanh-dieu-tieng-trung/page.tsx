import { TonePairsTrainer } from "@/components/tools/tone-pairs-trainer";
import { ToolPage, toolMetadata, type ToolFaq } from "@/components/tools/tool-page";

const HREF = "/cap-thanh-dieu-tieng-trung";
const TITLE = "20 cặp thanh điệu tiếng Trung: nghe từ mẫu và luyện tai (miễn phí) | SongHanzi";
const DESCRIPTION = "Nghe bốn thanh điệu tiếng Trung, rồi luyện đủ 20 cặp thanh (thanh 1 đến 4 và thanh nhẹ) với từ thật, kèm mẹo đổi thanh và trò nghe đoán cặp. Miễn phí.";

const FAQ: ToolFaq[] = [
  { q: "20 cặp thanh điệu là gì?", a: "Từ hai âm tiết ghép thanh của âm đầu (1–4) với thanh của âm sau (1–4 hoặc thanh nhẹ), cho 4 × 5 = 20 cách. Luyện đủ 20 cặp giúp tai và miệng quen với mọi tổ hợp thường gặp." },
  { q: "Vì sao 你好 đọc là ní hǎo?", a: "Quy tắc biến điệu: hai thanh 3 liền nhau thì thanh 3 đầu đọc thành thanh 2. Vẫn viết nǐ hǎo nhưng nói ní hǎo." },
  { q: "Thanh nhẹ là gì?", a: "Âm tiết đọc ngắn, nhẹ, không có đường cao độ riêng, như chữ sau trong 妈妈 (māma) hay 谢谢 (xièxie)." },
  { q: "Làm sao luyện hiệu quả?", a: "Nghe từ mẫu vài lần, đọc theo rồi thử trò nghe đoán cặp. Để kiểm tra giọng của bạn, dùng công cụ Kiểm tra thanh điệu bằng giọng ở mục Phát âm." },
];

export const metadata = toolMetadata(HREF, TITLE, DESCRIPTION);

/** Trang công cụ công khai (được lập chỉ mục): bốn thanh và 20 cặp thanh điệu. */
export default function TonePairsPage() {
  return (
    <ToolPage href={HREF} name="20 cặp thanh điệu tiếng Trung" description={DESCRIPTION} h1="20 cặp thanh điệu tiếng Trung" intro="Nghe bốn thanh, luyện đủ 20 cặp với từ thật, rồi thử nghe đoán cặp thanh." faq={FAQ} wide>
      <TonePairsTrainer />
    </ToolPage>
  );
}
