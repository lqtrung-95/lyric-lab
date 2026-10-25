import type { Metadata } from "next";
import Link from "next/link";
import { SCENES } from "@/lib/explore/scenes";

export const metadata: Metadata = { title: "Khám phá", robots: { index: false } };

/** Danh sách cảnh khám phá (bản thử, chưa có trong menu). */
export default function ExploreIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <h1 className="text-headline-lg">Khám phá</h1>
      <p className="text-body-md text-on-surface-variant">Bản thử: đi vào một căn phòng, chạm vào đồ vật để học từ tiếng Trung theo ngữ cảnh.</p>
      <Link href="/kham-pha/vu-an/hop-go" className="card-ink block p-space-md hover:-translate-y-0.5"><span className="text-headline-md">Vụ án chiếc hộp gỗ biến mất</span> <span className="ml-1 rounded-full border-2 border-ink bg-tertiary-container px-2 py-0.5 text-label-sm font-extrabold">Dễ</span><span className="block text-body-md text-on-surface-variant">Chế độ phá án: hỏi chuyện bằng tiếng Trung, tìm manh mối, vạch mặt kẻ nói dối.</span></Link>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {Object.values(SCENES).map((s) => (
          <li key={s.id}><Link href={`/kham-pha/${s.id}`} className="card-ink block p-space-md hover:-translate-y-0.5"><span className="text-headline-md">{s.title}</span><span className="block text-body-md text-on-surface-variant">{s.objects.length} từ</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
