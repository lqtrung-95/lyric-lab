"use client";

import { useState } from "react";
import { AvatarUploader } from "@/components/profile/avatar-uploader";
import { NicknameForm } from "@/components/leaderboard/nickname-form";
import { useNickname } from "@/components/profile/use-nickname";
import { Skeleton } from "@/components/ui/skeleton";

/** Biệt danh và ảnh đại diện của tài khoản: MỘT bộ giá trị dùng chung cho phòng thi đấu và bảng xếp hạng (bảng xếp hạng chỉ hiện khi bạn bật tham gia ở đó). */
export function NicknameSection() {
  const { nickname, optedIn, avatarUrl, reload, save } = useNickname();
  const [saved, setSaved] = useState(false);

  return (
    <section aria-labelledby="nickname-heading" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
      <h2 id="nickname-heading" className="font-serif text-headline-md text-on-surface">Biệt danh và ảnh đại diện</h2>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Tên và ảnh hiển thị của bạn ở phòng thi đấu và bảng xếp hạng. {optedIn ? "Bạn đang tham gia bảng xếp hạng." : "Điểm của bạn chỉ hiện trên bảng xếp hạng khi bạn bật tham gia ở trang Bảng xếp hạng."}
      </p>
      {nickname === undefined ? (
        <Skeleton className="mt-space-sm h-12 w-full max-w-md" />
      ) : (
        <>
          {nickname ? (
            <div className="mt-space-sm flex items-center gap-3">
              <AvatarUploader nickname={nickname} avatarUrl={avatarUrl} onUploaded={reload} />
              <p className="text-label-md text-on-surface-variant">Bấm vào ảnh để đổi (JPG, PNG hoặc WebP, tối đa 2MB).</p>
            </div>
          ) : (
            <p className="mt-space-sm text-label-md text-on-surface-variant">Đặt biệt danh trước, sau đó bạn có thể thêm ảnh đại diện.</p>
          )}
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
