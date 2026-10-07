"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NicknameGate } from "@/components/profile/nickname-gate";
import { useNickname } from "@/components/profile/use-nickname";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { SongPicker } from "./song-picker";

const ERRORS: Record<string, string> = {
  song_unavailable: "Bài này chưa đủ dữ liệu để ra câu hỏi. Hãy chọn bài khác hoặc để ngẫu nhiên.",
  rate_limited: "Bạn tạo hơi nhiều rồi. Thử lại sau nhé.",
  nickname_required: "Hãy đặt biệt danh trước.",
};

/** Hộp thoại tạo thử thách không cần cùng lúc: biệt danh, chọn bài (ngẫu nhiên hoặc tự chọn), rồi vào trang thử thách để chơi trước đặt điểm chuẩn. */
export function CreateChallengeDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const ref = useRef<HTMLDialogElement>(null);
  const nick = useNickname();
  const [pick, setPick] = useState(false);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function create() {
    if (pick && !videoId) return setError("Chọn một bài hoặc đổi sang “Ngẫu nhiên”.");
    setBusy(true);
    setError(null);
    await ensureAnonymousSession();
    const res = await fetch("/api/challenges", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ videoId: pick ? videoId : null }) }).catch(() => null);
    const body = res ? ((await res.json().catch(() => null)) as { code?: string; error?: string } | null) : null;
    if (res?.ok && body?.code) return router.push(`/challenge/${body.code}`);
    setError(ERRORS[body?.error ?? ""] ?? "Chưa tạo được thử thách. Thử lại sau nhé.");
    setBusy(false);
  }

  const radio = (on: boolean) => `flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-label-md font-medium transition-colors ${on ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`;
  return (
    <dialog
      ref={ref} aria-labelledby="create-challenge-title" onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }}
      className="m-auto w-[min(94vw,30rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="space-y-space-md p-space-lg">
        <h2 id="create-challenge-title" className="font-serif text-headline-md">Tạo thử thách</h2>
        <p className="text-body-md text-on-surface-variant">Bạn chơi trước để đặt điểm chuẩn, rồi gửi link cho bạn bè. Họ chơi lúc nào cũng được.</p>
        <NicknameGate state={nick} />
        <fieldset className="min-w-0">
          <legend className="text-label-md font-medium text-on-surface">Bài hát</legend>
          <div className="mt-1 flex gap-2">
            <label className={radio(!pick)}><input type="radio" name="challenge-song-mode" checked={!pick} onChange={() => setPick(false)} className="sr-only" />Ngẫu nhiên</label>
            <label className={radio(pick)}><input type="radio" name="challenge-song-mode" checked={pick} onChange={() => setPick(true)} className="sr-only" />Tự chọn bài</label>
          </div>
          {pick && <div className="mt-space-sm"><SongPicker selected={videoId} onSelect={setVideoId} /></div>}
        </fieldset>
        {error && <p role="alert" className="text-label-md text-error">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="min-h-11 rounded-full px-5 text-label-md font-medium hover:bg-surface-container-high">Hủy</button>
          <button type="button" disabled={busy || !nick.nickname} onClick={() => void create()} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary disabled:opacity-60">{busy ? "Đang tạo…" : "Tạo và chơi"}</button>
        </div>
      </div>
    </dialog>
  );
}
