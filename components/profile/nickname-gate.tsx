"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { NicknameForm } from "@/components/leaderboard/nickname-form";
import { Skeleton } from "@/components/ui/skeleton";
import type { NicknameState } from "./use-nickname";

/**
 * Cần biệt danh mới đi tiếp (vào phòng thi đấu): chưa có thì hiện form đặt ngay tại chỗ (lưu vào hồ sơ dùng chung, không tự công khai điểm
 * trên bảng xếp hạng), có rồi thì hiện dòng "Bạn chơi với tên … (đổi ở Cài đặt)" và các phần con. `state` từ `useNickname()` do nơi dùng giữ
 * để biết lúc nào đã có biệt danh (bật/tắt nút) và dùng chung một lần tải. `loading` là khung chờ cùng kích thước nội dung thật của nơi dùng
 * để bố cục không nhảy khi tải xong.
 */
export function NicknameGate({ state, loading, children }: { state: NicknameState; loading?: ReactNode; children?: (nickname: string) => ReactNode }) {
  const { nickname, save } = state;
  if (nickname === undefined) return <>{loading ?? <Skeleton className="h-12 w-full" />}</>;
  if (nickname === null) {
    return (
      <div>
        <p className="text-body-md text-on-surface">Đặt biệt danh để chơi với bạn bè. Biệt danh này dùng chung ở phòng thi đấu và bảng xếp hạng, đổi được ở Cài đặt.</p>
        <NicknameForm submitLabel="Lưu biệt danh" onSubmit={save} />
      </div>
    );
  }
  return (
    <>
      <p className="text-label-md text-on-surface-variant">
        Bạn chơi với tên <strong className="text-on-surface">{nickname}</strong> · <Link href="/settings" className="font-medium text-primary hover:underline">đổi ở Cài đặt</Link>
      </p>
      {children?.(nickname)}
    </>
  );
}
