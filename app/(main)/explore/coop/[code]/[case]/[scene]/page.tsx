import { notFound, redirect } from "next/navigation";
import { COOP_CODE, parseRole } from "@/lib/explore/coop/coop-state";

const ID = /^[a-z0-9-]{1,40}$/;

/**
 * Liên kết vào phòng chơi chung: người tạo phòng vào bằng `?r=a`, liên kết mời không có `r` nên người nhận là vai B.
 * Chuyển ngay sang đường dẫn có vai (`/explore/coop/<mã>/play/<vai>/<vụ án>/<cảnh>`) để vai được giữ khi đổi cảnh.
 */
export default async function CoopEntryRoute({ params, searchParams }: { params: Promise<{ code: string; case: string; scene: string }>; searchParams: Promise<{ r?: string }> }) {
  const [{ code, case: caseId, scene: sceneId }, { r }] = await Promise.all([params, searchParams]);
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room) || !ID.test(caseId) || !ID.test(sceneId)) notFound();
  redirect(`/explore/coop/${room}/play/${parseRole(r)}/${caseId}/${sceneId}`);
}
