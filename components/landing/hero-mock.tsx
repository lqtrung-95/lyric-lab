import { Icon } from "@/components/ui/icon";

// Minh họa sản phẩm trong hero. Bài "夜车" là bài hư cấu do nhóm sản phẩm tự viết (không phải bài hát thật).
const LYRICS = [
  { zh: "窗外的城市慢慢睡了", py: "chuāng wài de chéngshì mànmàn shuì le" },
  { zh: "我从来没想过会离开", py: "wǒ cónglái méi xiǎng guò huì líkāi" },
  { zh: "你的笑比星光还亮", py: "nǐ de xiào bǐ xīngguāng hái liàng" },
];

/** Hai thẻ xếp chồng: thẻ từ vựng (xem trước) và lời đang chạy (nghe). Chỉ để minh họa nên ẩn khỏi trình đọc màn hình. */
export function HeroMock() {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md select-none lg:max-w-none">
      <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-primary-fixed/60 via-transparent to-secondary-container/50 blur-2xl" />

      <div className="anim-float relative rotate-[1.5deg] rounded-3xl bg-surface-container-lowest p-6 shadow-[0_24px_60px_-20px_rgba(60,30,20,0.35)] ring-1 ring-outline-variant/40">
        <div className="flex items-start justify-between">
          <div>
            <p lang="zh" className="font-serif text-[56px] font-medium leading-none tracking-wide text-on-surface">离开</p>
            <p className="mt-2 flex items-center gap-2 text-pinyin-reading text-primary">
              lí kāi <span className="text-outline">•</span>
              <span className="text-hanviet-reading uppercase tracking-wider text-secondary">ly khai</span>
            </p>
          </div>
          <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-label-sm text-on-surface-variant">HSK 3</span>
        </div>
        <p className="mt-4 text-body-lg font-medium text-on-surface">rời đi, rời khỏi</p>
        <div className="mt-3 rounded-xl bg-surface-container-low p-3">
          <p className="text-label-sm uppercase tracking-wider text-on-surface-variant">Trích đoạn lời bài hát</p>
          <p lang="zh" className="mt-1 text-hanzi-body text-on-surface">
            我从来没想过会<span className="underline decoration-primary decoration-2 underline-offset-4">离开</span>
          </p>
          <p className="text-label-md italic text-on-surface-variant">Anh chưa từng nghĩ mình sẽ rời đi</p>
        </div>
        <div className="mt-4 flex items-center gap-2 text-label-md font-semibold">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-primary"><Icon name="play_circle" size={18} />Nghe đoạn này</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1.5 text-on-secondary-container"><Icon name="bookmark_add" size={18} />Lưu</span>
        </div>
      </div>

      <div className="anim-float-late relative -mt-6 ml-6 -rotate-[1deg] rounded-3xl bg-inverse-surface p-5 text-inverse-on-surface shadow-[0_24px_60px_-24px_rgba(20,10,5,0.6)] sm:ml-12">
        <div className="mb-3 flex items-center justify-between text-label-sm uppercase tracking-wider opacity-80">
          <span className="inline-flex items-center gap-1.5"><Icon name="graphic_eq" size={16} />Đang hát · 0:05</span>
          <span>0.75x</span>
        </div>
        <ul className="space-y-2.5">
          {LYRICS.map((l, i) => (
            // Ba dòng lần lượt sáng lên như đang hát (chu kỳ 9 giây, lệch 3 giây mỗi dòng).
            <li key={l.zh} className="anim-line opacity-70" style={{ animationDelay: `${(i - 1) * 3}s` }}>
              <p className="text-label-sm">{l.py}</p>
              <p lang="zh" className="font-serif text-[22px]">{l.zh}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
