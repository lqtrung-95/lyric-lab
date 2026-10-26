import type { Metadata } from "next";
import Link from "next/link";
import { SCENES } from "@/lib/explore/scenes";
import { DifficultyBadge } from "@/components/explore/story/difficulty-badge";
import { CASES } from "@/lib/explore/story/cases";

export const metadata: Metadata = { title: "Khám phá", robots: { index: false } };

/** Danh sách cảnh khám phá (bản thử, chưa có trong menu). */
export default function ExploreIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <h1 className="text-headline-lg">Khám phá</h1>
      <p className="text-body-md text-on-surface-variant">Bản thử: đi vào một căn phòng, chạm vào đồ vật để học từ tiếng Trung theo ngữ cảnh.</p>
      <ul className="grid gap-space-sm">
        {Object.values(CASES).map((c) => (
          <li key={c.id}>
            <Link href={`/explore/cases/${c.id}`} className="card-ink block p-space-md hover:-translate-y-0.5">
              <span className="text-headline-md">{c.title}</span>
              <span className="ml-2 align-middle"><DifficultyBadge level={c.difficulty} /></span>
              <span className="block text-body-md text-on-surface-variant">Chế độ phá án: hỏi chuyện bằng tiếng Trung, tìm manh mối, vạch mặt kẻ nói dối.</span>
            </Link>
          </li>
        ))}
      </ul>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {Object.values(SCENES).map((s) => (
          <li key={s.id}><Link href={`/explore/${s.id}`} className="card-ink block p-space-md hover:-translate-y-0.5"><span className="text-headline-md">{s.title}</span><span className="block text-body-md text-on-surface-variant">{s.objects.length} từ</span></Link></li>
        ))}
      </ul>
      <p className="text-label-md text-on-surface-variant">Nhạc nền: leberch, the_mountain, MondaMusic (Pixabay).</p>
    </div>
  );
}
