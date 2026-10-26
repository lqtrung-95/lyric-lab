import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PronunciationPageShell, pageMetadata } from "@/components/pronunciation/pronunciation-page-shell";
import type { IconName } from "@/components/ui/icon-names";

const PATH = "/phat-am";
const TITLE = "Luyện phát âm tiếng Trung cho người Việt | SongHanzi";
const DESCRIPTION = "Bảng pinyin có giọng chuẩn, luyện thanh điệu, đọc to chấm điểm từng chữ, trò nghe đoán thanh. Công cụ luyện phát âm tiếng Trung miễn phí cho người Việt.";
const FAQ = [
  { q: "Người Việt học phát âm tiếng Trung khó ở đâu?", a: "Thường ở ba chỗ: âm bật hơi (p, t, k), nhóm âm uốn lưỡi (zh, ch, sh) và phân biệt thanh 2 với thanh 3." },
  { q: "Cần chuẩn bị gì?", a: "Một trình duyệt hiện đại, loa hoặc tai nghe; thêm micro nếu muốn luyện thanh điệu. Không cần tài khoản." },
];
const ITEMS: { href: string; title: string; body: string; icon: IconName }[] = [
  { href: "/phat-am/luyen-moi-ngay", title: "Luyện 5 phút mỗi ngày", body: "Nghe thanh, đọc câu, 绕口令; giữ chuỗi ngày luyện.", icon: "local_fire_department" },
  { href: "/phat-am/lo-trinh", title: "Lộ trình 6 bước", body: "Từ phụ âm, vần, thanh điệu đến đọc cả câu.", icon: "list_alt" },
  { href: "/phat-am/rao-khau-lenh", title: "Thử thách 绕口令", body: "Câu thách đọc nhanh, chấm điểm và chia sẻ.", icon: "emoji_events" },
  { href: "/phat-am/bang-pinyin", title: "Bảng pinyin có giọng đọc", body: "Phụ âm đầu và vần, mẹo so với tiếng Việt, lỗi hay gặp.", icon: "dictionary" },
  { href: "/phat-am/luyen-thanh-dieu", title: "Luyện thanh điệu", body: "Ghi âm và xem đường cao độ giọng bạn so với thanh mẫu.", icon: "mic" },
  { href: "/phat-am/doc-to-cham-diem", title: "Đọc to, chấm từng chữ", body: "Đọc một câu, nhận điểm từng chữ và gợi ý sửa.", icon: "graphic_eq" },
  { href: "/phat-am/nghe-doan-thanh", title: "Nghe đoán thanh", body: "Trò 8 câu luyện tai nghe thanh 1–4.", icon: "headphones" },
];

export const metadata = pageMetadata(PATH, TITLE, DESCRIPTION);

export default function PronunciationHubPage() {
  return (
    <PronunciationPageShell path={PATH} name="Luyện phát âm tiếng Trung" description={DESCRIPTION} title="Luyện phát âm tiếng Trung" intro="Từ bảng pinyin đến thanh điệu: nghe, đọc, và xem giọng mình khác mẫu ở đâu." faq={FAQ}>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {ITEMS.map((it) => (
          <li key={it.href}>
            <Link href={it.href} className="flex h-full min-h-11 gap-space-sm card-ink p-space-md hover:bg-surface-container">
              <Icon name={it.icon} size={28} className="shrink-0 text-primary" />
              <span><span className="block text-body-lg font-medium">{it.title}</span><span className="block text-body-md text-on-surface-variant">{it.body}</span></span>
            </Link>
          </li>
        ))}
      </ul>
    </PronunciationPageShell>
  );
}
