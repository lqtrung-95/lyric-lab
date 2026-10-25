import type { Metadata } from "next";
import Link from "next/link";
import { SCENES } from "@/lib/explore/scenes/room-scene";

export const metadata: Metadata = { title: "Khám phá", robots: { index: false } };

/** Danh sách cảnh khám phá (bản thử, chưa có trong menu). */
export default function ExploreIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <h1 className="text-headline-lg">Khám phá</h1>
      <p className="text-body-md text-on-surface-variant">Bản thử: đi vào một căn phòng, chạm vào đồ vật để học từ tiếng Trung theo ngữ cảnh.</p>
      <ul className="grid gap-space-sm sm:grid-cols-2">
        {Object.values(SCENES).map((s) => (
          <li key={s.id}><Link href={`/kham-pha/${s.id}`} className="card-ink block p-space-md hover:-translate-y-0.5"><span className="text-headline-md">{s.title}</span><span className="block text-body-md text-on-surface-variant">{s.objects.length} từ</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
