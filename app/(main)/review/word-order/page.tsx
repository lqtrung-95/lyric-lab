import type { Metadata } from "next";
import { ModeTabs } from "@/components/review/mode-tabs";
import { WordOrderGame } from "@/components/practice/word-order-game";
import { loadWordOrderSet } from "@/lib/practice/load-practice-sets";

export const metadata: Metadata = { title: "Xếp câu", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Xếp câu: ghép các thẻ từ thành câu tiếng Trung theo nghĩa tiếng Việt; câu lấy ngẫu nhiên từ các hội thoại. */
export default async function WordOrderPage() {
  const items = await loadWordOrderSet();
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Xếp câu</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Cho nghĩa tiếng Việt, hãy xếp các thẻ từ thành câu tiếng Trung đúng trật tự. Câu lấy từ các bài Hội thoại. Làm xong được tính điểm luyện tập (XP) cho các câu đúng ngay lần đầu.</p>
        <div className="mt-space-md"><WordOrderGame key={items.map((i) => i.zh).join("")} items={items} /></div>
      </div>
    </>
  );
}
