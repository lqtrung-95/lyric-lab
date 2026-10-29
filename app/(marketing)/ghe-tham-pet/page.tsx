import type { Metadata } from "next";
import Link from "next/link";
import { PetVisitScene } from "@/components/pet/pet-visit-scene";
import { parseVisit } from "@/lib/pet/pet-visit";

export const metadata: Metadata = { title: "Ghé thăm bạn nhỏ", robots: { index: false, follow: false } };

/** Trang đích của link mời "đến thăm pet": đọc ảnh chụp pet từ tham số link (đã kiểm tra), không cần đăng nhập, không lập chỉ mục. */
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const visit = parseVisit(new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))));
  if (!visit) {
    return (
      <div className="mx-auto max-w-xl py-space-lg text-center">
        <h1 className="font-serif text-headline-md">Link này chưa dùng được</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">Link mời đến thăm bị thiếu hoặc sai. Hãy nhờ bạn của bạn gửi lại link mới.</p>
        <Link href="/" className="mt-space-sm inline-flex min-h-11 items-center font-bold text-primary underline">Về trang chủ SongHanzi</Link>
      </div>
    );
  }
  return <div className="py-space-md"><PetVisitScene visit={visit} /></div>;
}
