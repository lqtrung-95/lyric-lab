const LEVELS = [
  { level: "HSK 1–2", note: "Mới bắt đầu", body: "Làm quen câu đơn giản và những từ hay gặp nhất trong lời ca." },
  { level: "HSK 3–4", note: "Trung cấp", body: "Bắt đầu hiểu trọn lời ca C-pop, gặp ngữ pháp thường dùng." },
  { level: "HSK 5–6", note: "Nâng cao", body: "Từ ngữ giàu hình ảnh, thành ngữ và cách nói văn chương." },
  { level: "HSK 7–9", note: "Thành thạo", body: "Lời cổ phong và ẩn dụ, những từ hiếm ngoài đề thi." },
];

/** Dành cho người học ở cấp nào: trấn an rằng danh sách từ điều chỉnh theo level. */
export function AudienceLevels() {
  return (
    <section aria-labelledby="levels-heading" className="mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Dành cho mọi trình độ</p>
      <h2 id="levels-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Bài hát nào cũng vừa sức, vì từ vựng chọn theo level của bạn</h2>
      <ul className="mt-space-lg grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {LEVELS.map((l) => (
          <li key={l.level} className="rounded-3xl bg-surface-container-low p-space-md">
            <p className="font-serif text-headline-md text-primary">{l.level}</p>
            <p className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">{l.note}</p>
            <p className="mt-2 text-body-md text-on-surface-variant">{l.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
