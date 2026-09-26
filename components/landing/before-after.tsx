/** Một câu hát trước và sau khi qua Lyric Lab: thấy ngay giá trị của pinyin, Hán Việt, nghĩa và từ được chọn. */
export function BeforeAfter() {
  return (
    <section aria-labelledby="ba-heading" className="mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Một câu hát, hai cách nghe</p>
      <h2 id="ba-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Từ “nghe không hiểu” đến “hiểu từng chữ”</h2>
      <div className="mt-space-lg grid gap-space-md md:grid-cols-2">
        <figure className="rounded-3xl bg-surface-container-low p-space-lg">
          <figcaption className="text-label-md font-semibold uppercase tracking-widest text-on-surface-variant">Chỉ có lời gốc</figcaption>
          <p lang="zh" className="mt-space-md font-serif text-[30px] leading-snug text-on-surface">我从来没想过会离开</p>
          <p className="mt-space-md text-body-md text-on-surface-variant">Chữ nào là từ, chữ nào là ngữ pháp? Đọc thế nào? Nghĩa là gì? Bạn phải tự tra từng chữ.</p>
        </figure>
        <figure className="rounded-3xl bg-surface-container-lowest p-space-lg shadow-[0_1px_10px_rgba(30,26,22,0.08)] ring-1 ring-primary/15">
          <figcaption className="text-label-md font-semibold uppercase tracking-widest text-primary">Qua Lyric Lab</figcaption>
          <p className="mt-space-md text-pinyin-reading text-on-surface-variant">wǒ <span className="text-primary">cónglái méi</span> xiǎng <span className="text-primary">guò</span> huì <span className="text-primary">líkāi</span></p>
          <p lang="zh" className="font-serif text-[30px] leading-snug text-on-surface">
            我<mark className="rounded bg-primary/10 px-0.5 font-semibold text-primary underline decoration-primary/50 underline-offset-4">从来</mark>没想过会<mark className="rounded bg-primary/10 px-0.5 font-semibold text-primary underline decoration-primary/50 underline-offset-4">离开</mark>
          </p>
          <p className="mt-2 text-body-md italic text-on-surface-variant">Anh chưa từng nghĩ mình sẽ rời đi</p>
          <dl className="mt-space-md space-y-2 text-body-md">
            <div className="flex flex-wrap gap-x-2"><dt lang="zh" className="font-serif font-semibold text-on-surface">离开</dt><dd className="text-on-surface-variant"><span className="uppercase tracking-wider text-secondary">ly khai</span> · rời đi, rời khỏi</dd></div>
            <div className="flex flex-wrap gap-x-2"><dt lang="zh" className="font-serif font-semibold text-on-surface">从来没 + V + 过</dt><dd className="text-on-surface-variant">chưa từng làm gì</dd></div>
          </dl>
        </figure>
      </div>
    </section>
  );
}
