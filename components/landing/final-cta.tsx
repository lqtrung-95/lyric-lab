import { Icon } from "@/components/ui/icon";

/** Lời mời cuối trang: cuộn lên ô dán link. */
export function FinalCta() {
  return (
    <section aria-labelledby="cta-heading" className="relative isolate mt-24 overflow-hidden rounded-[2rem] bg-primary px-space-md py-16 text-center text-on-primary">
      <span aria-hidden="true" lang="zh" className="pointer-events-none absolute -left-6 -top-16 -z-10 font-serif text-[18rem] leading-none text-on-primary/[0.07]">学</span>
      <h2 id="cta-heading" className="mx-auto max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Bài hát tiếp theo bạn nghe có thể là bài học tiếng Trung đầu tiên</h2>
      <p className="mx-auto mt-space-sm max-w-xl text-body-lg text-on-primary/85">Không cần cài đặt, không cần đăng ký. Dán một link YouTube và bắt đầu.</p>
      <a href="#paste" className="mt-space-lg inline-flex min-h-12 items-center gap-2 rounded-full bg-surface px-8 text-label-md font-semibold text-primary hover:bg-surface-container-lowest">
        <Icon name="link" size={20} />
        Dán link bài hát
      </a>
    </section>
  );
}
