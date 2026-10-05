"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { Skeleton } from "@/components/ui/skeleton";
import { JoinRoomForm } from "./join-room-form";
import { RoomLobby } from "./room-lobby";
import { RoomPlay } from "./room-play";
import { RoomResult } from "./room-result";
import { useRoom } from "./use-room";

const box = "mx-auto max-w-md rounded-2xl bg-surface-container-lowest p-space-lg text-center shadow-sm";

/** Màn của một phòng (`/room/[code]`): vào phòng nếu chưa là thành viên, phòng chờ, ván chơi, kết quả, hoặc thông báo lỗi/hết hạn. */
export function RoomScreen({ code }: { code: string }) {
  const router = useRouter();
  const room = useRoom(code);
  const { view, error, refresh } = room;

  // Người mở thẳng link mời chưa có phiên: tạo phiên ẩn danh rồi tải lại (một lần), sau đó sẽ thấy form vào phòng.
  const triedAuth = useRef(false);
  useEffect(() => {
    if (error !== "auth_required" || triedAuth.current) return;
    triedAuth.current = true;
    void ensureAnonymousSession().then((ok) => { if (ok) void refresh(); });
  }, [error, refresh]);

  if (error === "not_found") {
    return (
      <div className={box}>
        <h1 className="font-serif text-headline-md">Vào phòng <span className="font-mono text-primary">#{code}</span></h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Nhập tên hiển thị để vào phòng thi đấu.</p>
        <div className="mt-space-md text-left"><JoinRoomForm fixedCode={code} onJoined={() => void refresh()} /></div>
        <Link href="/room" className="mt-space-sm inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">Về sảnh Thi đấu</Link>
      </div>
    );
  }
  if (error === "network" && !view) {
    return (
      <div role="alert" className={box}>
        <h1 className="font-serif text-headline-md">Chưa tải được phòng</h1>
        <button type="button" onClick={() => void refresh()} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Thử lại</button>
      </div>
    );
  }
  if (!view) {
    return (
      <div role="status" aria-label="Đang tải phòng" className="mx-auto max-w-2xl space-y-space-md">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }
  if (view.status === "expired") {
    return (
      <div className={box}>
        <h1 className="font-serif text-headline-md">Phòng đã hết hạn</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Phòng chờ chỉ giữ trong 10 phút. Hãy tạo phòng mới để chơi tiếp.</p>
        <button type="button" onClick={() => router.push("/room")} className="mt-space-md min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Về sảnh Thi đấu</button>
      </div>
    );
  }
  if (view.status === "playing") return <RoomPlay room={room} />;
  if (view.status === "finished") return <RoomResult room={room} />;
  return <RoomLobby room={room} />;
}
