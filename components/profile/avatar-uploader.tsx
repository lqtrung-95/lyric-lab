"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { AvatarCircle } from "@/components/leaderboard/avatar-circle";

interface AvatarUploaderProps {
  nickname: string;
  avatarUrl: string | null;
  onUploaded: (avatarUrl: string) => void;
}

/** Ảnh đại diện của tài khoản (dùng chung ở phòng thi đấu và bảng xếp hạng), bấm để đổi (JPG/PNG/WebP, tối đa 2MB). */
export function AvatarUploader({ nickname, avatarUrl, onUploaded }: AvatarUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // cho chọn lại đúng file đó lần sau nếu muốn
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await fetch("/api/leaderboard/avatar", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error === "too_large" ? "Ảnh quá 2MB, chọn ảnh nhỏ hơn nhé." : body.error === "unsupported_type" ? "Chỉ nhận JPG, PNG hoặc WebP." : "Chưa tải lên được, thử lại sau nhé.");
        return;
      }
      const data = (await res.json()) as { avatarUrl: string };
      onUploaded(data.avatarUrl);
    } catch {
      setError("Chưa tải lên được, thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button" disabled={busy} onClick={() => inputRef.current?.click()}
        aria-label="Đổi ảnh đại diện" title="Đổi ảnh đại diện"
        className="group relative rounded-full disabled:opacity-60"
      >
        <AvatarCircle nickname={nickname} avatarUrl={avatarUrl} size={64} />
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 text-transparent transition-colors group-hover:bg-black/40 group-hover:text-white">
          <Icon name="photo_camera" size={22} />
        </span>
      </button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={onFile} className="sr-only" aria-hidden="true" tabIndex={-1} />
      {error && <p role="alert" className="max-w-32 text-center text-label-sm text-error">{error}</p>}
    </div>
  );
}
