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
    icon: "smart_display", eyebrow: "Học qua video", title: "Podcast, vlog tiếng Trung: học theo ba cách",
    points: ["Phụ đề chạy theo video, bấm từ để tra nghĩa theo ngữ cảnh và lưu thẻ", "Nghe – chép: nghe từng câu rồi gõ chữ Hán hoặc pinyin (ni3 hao3 cũng đúng), chấm từng chữ", "Luyện nói: nói theo mẫu, nghe lại giọng mình, nhờ AI nhận xét thanh điệu (bản thử nghiệm)", "Thêm video YouTube có phụ đề tiếng Trung, bản dịch tiếng Việt do AI làm"],
    visual: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2"><span className={chip}>Phụ đề</span><span className={chip}>Nghe – chép</span><span className={chip}>Luyện nói</span></div>
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-md text-on-surface-variant">Cần điền <strong className="text-on-surface">6 chữ Hán</strong></p>
          <div className="mt-2 flex gap-1.5">{Array.from({ length: 6 }).map((_, k) => <span key={k} className="h-7 w-7 rounded-md border-b-2 border-outline bg-surface-container-high" />)}</div>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
          <p className="inline-flex items-center gap-2 text-label-md font-semibold text-on-surface"><Icon name="mic" size={16} />Nhận xét của AI · <span className="text-primary">92/100</span></p>
          <p className="mt-1 text-body-md text-on-surface-variant">Đọc rõ và trôi chảy. Chú ý thanh 3 ở “好”: hạ giọng rồi mới lên.</p>
        </div>
      </div>
    ),
  },
  {
    icon: "style", eyebrow: "Ôn tập", title: "Nhớ lâu nhờ ôn đúng lúc",
    points: ["Lưu từ thành flashcard chỉ với một cú bấm", "FSRS xếp lịch riêng cho từng thẻ, thẻ mới theo hạn mức mỗi ngày bạn đặt", "Ôn xong, nghe lại đúng câu hát chứa từ đó"],
    visual: (
      <div className="rounded-3xl bg-surface-container-lowest p-5 text-center shadow-[0_8px_30px_rgba(32,27,21,0.08)]">
        <p lang="zh" className="font-serif text-[60px] leading-none text-on-surface">离开</p>
        <p className="mt-2 text-pinyin-reading text-primary">lí kāi <span className="text-secondary">· LY KHAI</span></p>
        <div className="mt-4 grid grid-cols-4 gap-2 text-label-md font-semibold">
          {[["Quên", "1 ngày"], ["Khó", "2 ngày"], ["Được", "5 ngày"], ["Dễ", "10 ngày"]].map(([l, t]) => (<span key={l} className="rounded-xl bg-surface-container-high px-1 py-2 text-on-surface">{l}<br /><span className="font-normal text-on-surface-variant">{t}</span></span>))}
        </div>
      </div>
    ),
  },
  {
    icon: "quiz", eyebrow: "Luyện tập", title: "Biến từ đã lưu thành phản xạ",
    points: ["Năm trò chơi ngắn: gõ pinyin, điền lời, ghép cặp, nghe và chọn, karaoke điền lời", "Chơi theo nhịp của bạn, không đồng hồ đếm ngược, không mất mạng", "Chuỗi ngày học và mục tiêu tuần giữ bạn đều đặn", "Muốn thi đua? Vào bảng xếp hạng tuần bằng biệt danh tự đặt, không lộ email"],
    visual: (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">{["Gõ pinyin", "Điền lời", "Ghép cặp", "Nghe và chọn", "Karaoke"].map((m) => <span key={m} className={chip}>{m}</span>)}</div>
        <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-sm">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Xếp hạng tuần này</p>
          {[["1", "MeoCon", "4.820"], ["2", "Bạn", "4.310"], ["3", "TrangTM", "3.990"]].map(([r, n, p]) => (
            <p key={r} className={`mt-2 flex items-center gap-3 rounded-xl px-2 py-1.5 text-body-md ${n === "Bạn" ? "bg-secondary-container/50 font-semibold" : ""}`}><span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-high text-label-md">{r}</span><span className="flex-1 text-on-surface">{n}</span><span className="font-serif text-primary">{p}</span></p>
          ))}
        </div>
        <p className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1.5 text-label-md font-medium text-on-tertiary-fixed"><Icon name="local_fire_department" size={16} filled />5 ngày liên tiếp</p>
      </div>
    ),
  },
];

/** Các tính năng chính, mỗi tính năng một hàng xen kẽ chữ và hình minh họa (dữ liệu hư cấu 夜车). */
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
