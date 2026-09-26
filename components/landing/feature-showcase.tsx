import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

interface Row {
  icon: IconName;
  eyebrow: string;
  title: string;
  points: string[];
  visual: React.ReactNode;
}

const chip = "rounded-full bg-surface-container-high px-3 py-1 text-label-md text-on-surface-variant";

const ROWS: Row[] = [
  {
    icon: "auto_awesome", eyebrow: "Xem trước", title: "Chỉ học những gì đáng học",
    points: ["AI chọn từ vựng và mẫu ngữ pháp nổi bật của bài", "Lọc theo level HSK 3.0, ẩn từ bạn đã biết", "Pinyin và âm Hán Việt lấy từ từ điển, không phải AI đoán"],
    visual: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2"><span className={chip}>Tất cả (17)</span><span className={chip}>HSK 3</span><span className={chip}>HSK 4</span></div>
        {[["离开", "lí kāi · LY KHAI", "rời đi, rời khỏi"], ["回忆", "huí yì · HỒI ỨC", "ký ức, kỷ niệm"]].map(([z, p, m]) => (
          <div key={z} className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm"><p lang="zh" className="font-serif text-[34px] leading-none text-on-surface">{z}</p><p className="mt-1 text-pinyin-reading text-primary">{p}</p><p className="mt-1 text-body-md text-on-surface">{m}</p></div>
        ))}
      </div>
    ),
  },
  {
    icon: "headphones", eyebrow: "Nghe cùng lời", title: "Lời chạy theo nhạc, chạm là hiểu",
    points: ["Video YouTube gốc, lời sáng lên đúng câu đang hát", "Lặp một câu, nghe chậm 0,5x đến 1x", "Tra nghĩa theo đúng ngữ cảnh câu hát, kèm nút loa giọng AI", "Lời lệch nhạc? Tự chỉnh hoặc đồng bộ nhanh chỉ với một cú bấm"],
    visual: (
      <div className="rounded-3xl bg-inverse-surface p-5 text-inverse-on-surface">
        <p className="text-label-sm uppercase tracking-wider opacity-80">Đang hát · 0:05 · 0.75x</p>
        <p className="mt-3 text-label-sm opacity-70">chuāng wài de chéngshì mànmàn shuì le</p><p lang="zh" className="font-serif text-[20px] opacity-70">窗外的城市慢慢睡了</p>
        <p className="mt-3 text-label-sm">wǒ cónglái méi xiǎng guò huì líkāi</p><p lang="zh" className="font-serif text-[26px]">我从来没想过会离开</p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-inverse-on-surface/15 px-3 py-1.5 text-label-md"><Icon name="repeat_one" size={16} />Đang lặp câu 2</p>
      </div>
    ),
  },
  {
    icon: "style", eyebrow: "Ôn tập", title: "Nhớ lâu nhờ ôn đúng lúc",
    points: ["Lưu từ thành flashcard chỉ với một cú bấm", "FSRS xếp lịch riêng cho từng thẻ, thẻ mới theo hạn mức bạn đặt", "Ôn xong, nghe lại đúng câu hát chứa từ đó"],
    visual: (
      <div className="rounded-3xl bg-surface-container-lowest p-5 text-center shadow-[0_8px_30px_rgba(32,27,21,0.08)]">
        <p lang="zh" className="font-serif text-[60px] leading-none text-on-surface">离开</p>
        <p className="mt-2 text-pinyin-reading text-primary">lí kāi <span className="text-secondary">· LY KHAI</span></p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-label-md font-semibold">
          {[["Quên", "10 phút"], ["Khó", "1 ngày"], ["Được", "3 ngày"], ["Dễ", "7 ngày"]].map(([l, t]) => (<span key={l} className="rounded-xl bg-surface-container-high px-1 py-2 text-on-surface">{l}<br /><span className="font-normal text-on-surface-variant">{t}</span></span>))}
        </div>
      </div>
    ),
  },
];

/** Ba tính năng chính, mỗi tính năng một hàng xen kẽ chữ và hình minh họa (dữ liệu hư cấu 夜车). */
export function FeatureShowcase() {
  return (
    <section aria-label="Các bước học chi tiết" className="mt-24 space-y-24">
      {ROWS.map((r, i) => (
        <div key={r.title} className="grid items-center gap-space-lg lg:grid-cols-2 lg:gap-16">
          <div className={i % 2 === 1 ? "lg:order-2" : ""}>
            <p className="inline-flex items-center gap-2 text-label-md font-semibold uppercase tracking-widest text-secondary"><Icon name={r.icon} size={18} />{r.eyebrow}</p>
            <h3 className="mt-2 font-serif text-headline-lg-mobile md:text-headline-lg">{r.title}</h3>
            <ul className="mt-space-md space-y-3">
              {r.points.map((p) => <li key={p} className="flex gap-3 text-body-lg text-on-surface-variant"><Icon name="check_circle" size={22} filled className="mt-0.5 shrink-0 text-secondary" />{p}</li>)}
            </ul>
          </div>
          <div aria-hidden="true" className={`rounded-[2rem] bg-surface-container-low p-space-md md:p-space-lg ${i % 2 === 1 ? "lg:order-1" : ""}`}>{r.visual}</div>
        </div>
      ))}
    </section>
  );
}
