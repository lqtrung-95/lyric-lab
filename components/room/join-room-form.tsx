"use client";

import { useId, useState } from "react";
import { NicknameGate } from "@/components/profile/nickname-gate";
import { useNickname } from "@/components/profile/use-nickname";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeRoomCode } from "@/lib/rooms/room-code-format";
import { roomErrorMessage } from "@/lib/rooms/room-messages";
import { joinRoomRequest } from "./room-requests";

/**
 * Vào phòng bằng mã hoặc link, với biệt danh của tài khoản (chưa có thì đặt ngay tại đây). `fixedCode` có giá trị khi người dùng mở
 * thẳng link mời (không cần nhập mã). `onJoined` được gọi với mã phòng khi vào thành công.
 */
export function JoinRoomForm({ fixedCode, onJoined }: { fixedCode?: string; onJoined: (code: string) => void }) {
  const codeId = useId();
  const nick = useNickname();
  const [codeInput, setCodeInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const code = fixedCode ?? normalizeRoomCode(codeInput);

  async function join() {
    setSubmitted(true);
    if (!code) return;
    setBusy(true);
    setError(null);
    const result = await joinRoomRequest(code);
    if (result.ok) return onJoined(result.data.code);
    setError(roomErrorMessage(result.error));
    setBusy(false);
  }

  return (
    <div className="space-y-space-sm">
      <NicknameGate state={nick} loading={<JoinFormSkeleton fixedCode={fixedCode !== undefined} />}>
        {() => (
          <form onSubmit={(e) => { e.preventDefault(); void join(); }} className="space-y-space-sm">
            {!fixedCode && (
              <div>
                <label htmlFor={codeId} className="text-label-md font-medium text-on-surface">Mã 6 số hoặc link mời</label>
                <input
                  id={codeId} value={codeInput} onChange={(e) => setCodeInput(e.target.value)} inputMode="numeric" autoComplete="off"
                  aria-invalid={submitted && !code} placeholder="842 915"
                  className="mt-1 min-h-11 w-full rounded-xl bg-surface-container-high px-4 font-mono text-body-lg tracking-widest text-on-surface placeholder:text-on-surface-variant/70"
                />
                {submitted && !code && <p role="alert" className="mt-1 text-label-md text-error">{roomErrorMessage("invalid_code")}</p>}
              </div>
            )}
            {error && <p role="alert" className="text-label-md text-error">{error}</p>}
            <button type="submit" disabled={busy} className="min-h-11 w-full rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
              {busy ? "Đang vào…" : "Vào phòng"}
            </button>
          </form>
        )}
      </NicknameGate>
    </div>
  );
}

/** Khung chờ cùng cỡ với nội dung thật (dòng "Bạn chơi với tên", ô nhập mã, nút) để thẻ không đổi chiều cao khi hồ sơ tải xong. */
function JoinFormSkeleton({ fixedCode }: { fixedCode: boolean }) {
  return (
    <div role="status" aria-label="Đang tải" className="space-y-space-sm">
      <Skeleton className="h-5 w-56" />
      {!fixedCode && (
        <div className="space-y-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
      )}
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}
