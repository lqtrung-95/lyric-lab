import { notFound, redirect } from "next/navigation";
import { COOP_CODE, parseRole } from "@/lib/explore/coop/coop-state";

/** Liên kết thách đấu: không có `r` thì người nhận là vai B; người tạo phòng vào bằng `?r=a`. Chuyển sang đường dẫn có vai để vai nằm trong đường dẫn. */
export default async function DuelRoomEntry({ params, searchParams }: { params: Promise<{ code: string }>; searchParams: Promise<{ r?: string }> }) {
  const [{ code }, { r }] = await Promise.all([params, searchParams]);
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room)) notFound();
  redirect(`/review/duel/play/${room}/${parseRole(r)}`);
}
