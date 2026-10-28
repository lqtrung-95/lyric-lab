import { notFound, redirect } from "next/navigation";
import { COOP_CODE, parseRole } from "@/lib/explore/coop/coop-state";

/**
 * Liên kết mời vào phòng Hai thật một giả: không có `r` thì người nhận là vai B; người tạo phòng vào bằng `?r=a`.
 * Chuyển sang đường dẫn có vai (`/play/<mã>/<vai>`) để vai nằm trong đường dẫn, không bị mất.
 */
export default async function TruthRoomEntry({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ r?: string }> }) {
  const [{ code }, { r }] = await Promise.all([params, searchParams]);
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room)) notFound();
  redirect(`/review/truth-or-lie/play/${room}/${parseRole(r)}`);
}
