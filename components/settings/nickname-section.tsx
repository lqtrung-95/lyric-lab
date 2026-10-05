"use client";

import { useState } from "react";
import { NicknameForm } from "@/components/leaderboard/nickname-form";
import { useNickname } from "@/components/profile/use-nickname";
import { Skeleton } from "@/components/ui/skeleton";

/** Biệt danh của tài khoản: MỘT giá trị dùng chung cho phòng thi đấu và bảng xếp hạng (bảng xếp hạng chỉ hiện khi bạn bật tham gia ở đó). */
export function NicknameSection() {
  const { nickname, optedIn, save } = useNickname();
  const [saved, setSaved] = useState(false);

  return (
    <section aria-labelledby="nickname-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="nickname-heading" className="font-serif text-headline-md text-on-surface">Biệt danh</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Tên hiển thị của bạn ở phòng thi đấu và bảng xếp hạng. {optedIn ? "Bạn đang tham gia bảng xếp hạng." : "Điểm của bạn chỉ hiện trên bảng xếp hạng khi bạn bật tham gia ở trang Bảng xếp hạng."}
      </p>
      {nickname === undefined ? (
        <Skeleton className="mt-space-sm h-12 w-full max-w-md" />
      ) : (
        <>
          <NicknameForm
            initial={nickname ?? ""} submitLabel="Lưu biệt danh"
            onSubmit={async (value) => { const code = await save(value); setSaved(code === null); return code; }}
          />
          {saved && <p role="status" className="mt-1 text-label-md text-secondary">Đã lưu biệt danh.</p>}
        </>
      )}
    </section>
  );
}
