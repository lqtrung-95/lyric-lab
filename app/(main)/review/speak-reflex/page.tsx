import type { Metadata } from "next";
import { ModeTabs } from "@/components/review/mode-tabs";
import { ReflexGame } from "@/components/speaking/reflex-game";
import { loadReflexSet } from "@/lib/speaking/load-reflex-set";

export const metadata: Metadata = { title: "Hỏi nhanh – Đáp nhanh", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Hỏi nhanh – Đáp nhanh: nghe câu hỏi tiếng Trung và nói đáp ngay bằng micro, để quen phản xạ giao tiếp. Câu hỏi lấy từ các bài Hội thoại (HSK 4 trở xuống). */
export default async function SpeakReflexPage() {
  const { items, pinyin } = await loadReflexSet();
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hỏi nhanh – Đáp nhanh</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Nghe câu hỏi và nói đáp ngay. Luyện phản xạ: trả lời kịp quan trọng hơn trả lời hoàn hảo. Làm xong được tính điểm luyện tập (XP).</p>
        <div className="mt-space-md"><ReflexGame key={items.map((i) => i.id).join("")} items={items} pinyin={pinyin} /></div>
      </div>
    </>
  );
}
