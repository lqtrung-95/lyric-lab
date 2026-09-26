import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

const FEATURES: { icon: IconName; title: string; body: string; accent?: boolean }[] = [
  { icon: "translate", title: "Âm Hán Việt ngay cạnh pinyin", body: "离开 là ly khai, 回忆 là hồi ức. Vốn từ Hán Việt của bạn thành lối tắt để nhớ chữ Hán nhanh gấp đôi.", accent: true },
  { icon: "psychology", title: "Chỉ giữ từ vừa sức", body: "Đặt level HSK 3.0 của bạn, các từ quá dễ tự ẩn. Bấm “Đã biết” để không gặp lại." },
  { icon: "dictionary", title: "Tra từ ngay trong câu hát", body: "Chạm vào bất kỳ chữ nào: nghĩa từ điển cộng nghĩa theo đúng ngữ cảnh câu hát, trong vài giây." },
  { icon: "repeat_one", title: "Nghe lại đúng câu", body: "Lặp một câu, nghe chậm 0.5x–0.75x. Ở màn ôn, nghe lại đúng đoạn hát chứa từ đó." },
  { icon: "verified", title: "Luôn là chữ giản thể", body: "Dù lời gốc là phồn thể, mọi thứ hiển thị bằng giản thể để bạn học một hệ chữ nhất quán.", accent: true },
  { icon: "schedule", title: "Ôn tập FSRS", body: "Thuật toán ghi nhớ hiện đại, khoảng ôn tính riêng cho từng thẻ. Dữ liệu của bạn có thể xóa bất cứ lúc nào." },
];

/** Lưới sáu điểm mạnh; hai ô tô nền xanh nhấn vào Hán Việt và giản thể. */
export function FeaturesGrid() {
  return (
    <section id="features" aria-labelledby="features-heading" className="mt-24 scroll-mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Dành cho người Việt học tiếng Trung</p>
      <h2 id="features-heading" className="mt-2 max-w-2xl font-serif text-headline-lg-mobile md:text-headline-xl">Học chậm mà chắc, bằng thứ bạn vốn đã thích nghe</h2>
      <ul className="mt-space-lg grid gap-space-md md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <li key={f.title} className={`rounded-3xl p-space-md ${f.accent ? "bg-secondary-container/60" : "bg-surface-container-low"}`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-primary shadow-sm"><Icon name={f.icon} size={24} /></span>
            <h3 className="mt-space-md font-serif text-headline-md text-on-surface">{f.title}</h3>
            <p className="mt-2 max-w-xl text-body-md text-on-surface-variant">{f.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
