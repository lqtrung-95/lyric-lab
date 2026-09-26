import { PasteLinkForm } from "@/components/home/paste-link-form";
import { Icon } from "@/components/ui/icon";
import { HeroMock } from "./hero-mock";

const TRUST = ["Miễn phí", "Không cần đăng ký", "Chữ giản thể + âm Hán Việt"];

/** Hero trang chủ: lời hứa của sản phẩm, ô dán link (hành động chính) và hình minh họa. */
export function LandingHero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden rounded-[2rem] bg-surface-container-low px-space-md py-space-xl md:px-space-xl lg:py-16">
      {/* Nền: vệt sáng đỏ mực và chữ Hán mờ làm điểm nhấn văn chương. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_60%_at_88%_8%,color-mix(in_srgb,var(--primary-container)_20%,transparent),transparent),radial-gradient(50%_50%_at_5%_100%,color-mix(in_srgb,var(--secondary-container)_55%,transparent),transparent)]" />
      <span aria-hidden="true" lang="zh" className="anim-drift pointer-events-none absolute -bottom-16 right-2 -z-10 font-serif text-[22rem] leading-none text-primary/[0.05] md:text-[30rem]">歌</span>

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/80 px-3 py-1.5 text-label-md font-semibold text-primary ring-1 ring-outline-variant/50">
            <Icon name="music_note" size={16} filled />
            Học tiếng Trung qua bài hát
          </p>
          <h1 id="hero-heading" className="mt-space-md font-serif text-[38px] font-semibold leading-[1.15] tracking-tight text-on-surface md:text-[54px]">
            Nghe một bài hát,<br />
            <span className="text-primary">nhớ cả trăm chữ Hán.</span>
          </h1>
          <p className="mt-space-md max-w-xl text-body-lg text-on-surface-variant">
            Dán link YouTube. Lyric Lab chọn ra từ vựng và ngữ pháp đáng học, kèm pinyin và âm Hán Việt. Bạn nghe từng câu với lời chạy theo nhạc, rồi ôn lại đúng lúc sắp quên.
          </p>
          <div id="paste" className="mt-space-lg max-w-xl scroll-mt-24">
            <PasteLinkForm />
          </div>
          <ul className="mt-space-md flex flex-wrap gap-x-5 gap-y-2">
            {TRUST.map((t) => (
              <li key={t} className="inline-flex items-center gap-1.5 text-label-md text-on-surface-variant">
                <Icon name="check_circle" size={18} filled className="text-secondary" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <HeroMock />
      </div>
    </section>
  );
}
