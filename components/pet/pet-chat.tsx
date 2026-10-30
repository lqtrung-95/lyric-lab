"use client";

import { useEffect, useState } from "react";
import { useChatAccount } from "@/components/chat/use-chat-account";
import { MicIntro } from "@/components/speaking/mic-intro";
import { RoleplayChat } from "@/components/speaking/roleplay-chat";
import { signInGoogle } from "@/lib/auth/account-client";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { DEFAULT_PET_TONE, PET_TONE_EVENT, PET_TONE_INFO, PET_TONE_KEY, PET_TONES, parsePetTone, type PetTone } from "@/lib/roleplay/pet-tone";
import { findScenario } from "@/lib/roleplay/scenarios";
import { MAX_ROLEPLAY_TURNS } from "@/lib/roleplay/turn-schema";
import type { MicCheck } from "@/lib/speaking/vad-recorder";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

const PET_SCENARIO = findScenario("pet")!;

/** Chọn giọng nhận xét của bạn nhỏ trước khi vào buổi nói; nhớ ở thiết bị này. */
function ToneSelect({ tone, onChange }: { tone: PetTone; onChange: (t: PetTone) => void }) {
  return (
    <fieldset className="mb-space-sm">
      <legend className="text-label-lg font-extrabold">Giọng nhận xét của bạn nhỏ</legend>
      <div className="mt-1 grid gap-2 sm:grid-cols-2">
        {PET_TONES.map((t) => (
          <button key={t} type="button" aria-pressed={tone === t} onClick={() => onChange(t)} className={`min-h-11 cursor-pointer rounded-2xl border-2 border-ink px-3 py-2 text-left ${tone === t ? "bg-primary-container shadow-[0_3px_0_var(--shadow-ink)]" : "bg-surface-container-lowest hover:brightness-105"}`}>
            <span className="block text-label-lg font-extrabold">{PET_TONE_INFO[t].emoji} {PET_TONE_INFO[t].label}</span>
            <span className="block text-label-sm text-on-surface-variant">{PET_TONE_INFO[t].desc}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/**
 * Nói chuyện với pet bằng tiếng Trung đơn giản: dùng lại nguyên engine nhập vai (`/api/roleplay/turn`, kịch bản ẩn `pet`).
 * An toàn/chi phí do server lo: chỉ tài khoản đã đăng ký, hạn mức `roleplay` theo ngày (chung với Trò chuyện tự do), tối đa
 * `MAX_ROLEPLAY_TURNS` lượt mỗi buổi, lời người học bị coi là dữ liệu chứ không phải chỉ thị, pinyin từ từ điển, khóa AI chỉ ở server.
 * Trình độ lấy từ cấp HSK của người học (kẹp 1–4). Micro lỗi thì chuyển sang gõ chữ.
 */
export function PetChat({ name, onClose }: { name: string; onClose: () => void }) {
  const registered = useChatAccount();
  const learner = useLearnerState();
  const [mic, setMic] = useState<MicCheck | null>(null);
  // Pinyin câu mở đầu (từ điển, qua server). undefined = đang lấy; "" = không có (vẫn chat được, chỉ thiếu dòng pinyin).
  const [openingPinyin, setOpeningPinyin] = useState<string | undefined>(undefined);
  useEffect(() => {
    if (!registered) return;
    let live = true;
    fetch("/api/pet/opening")
      .then((r) => (r.ok ? (r.json() as Promise<{ pinyin?: string }>) : { pinyin: "" }))
      .catch(() => ({ pinyin: "" }))
      .then((d) => { if (live) setOpeningPinyin(d.pinyin ?? ""); });
    return () => { live = false; };
  }, [registered]);
  const level = Math.min(4, Math.max(1, learner.state.level));
  const [tone, setTone] = useLocalJson<PetTone>(PET_TONE_KEY, PET_TONE_EVENT, parsePetTone, DEFAULT_PET_TONE);

  let body;
  if (registered === undefined) body = <p role="status" className="text-body-md text-on-surface-variant">Đang kiểm tra tài khoản…</p>;
  else if (!registered) {
    body = (
      <div>
        <p className="text-body-md font-bold">Nói chuyện với {name} cần đăng nhập Google</p>
        <p className="mt-1 text-body-md text-on-surface-variant">Mỗi lượt nói dùng AI nên chỉ mở cho tài khoản đã đăng ký.</p>
        <button type="button" onClick={() => void signInGoogle()} className="mt-2 min-h-11 rounded-full bg-primary px-5 text-label-md font-bold text-on-primary hover:brightness-110">Đăng nhập bằng Google</button>
      </div>
    );
  } else if (mic === null) {
    body = <div><ToneSelect tone={tone} onChange={setTone} /><MicIntro title={`🐾 Nói chuyện với ${name}`} onStart={setMic} steps={[`Mục tiêu: ${PET_SCENARIO.goal}.`, `${name} mở lời hỏi một ngày của bạn thế nào, rồi micro tự bật: bạn kể bằng tiếng Trung đơn giản. Tối đa ${MAX_ROLEPLAY_TURNS} lượt.`, "Bấm vào từ trong câu của bạn nhỏ để tra nghĩa hoặc lưu thẻ ôn. Câu của bạn nhỏ do AI tạo nên có thể chưa thật tự nhiên; Pinyin lấy từ từ điển."]} /></div>;
  } else if (openingPinyin === undefined) {
    // Chờ pinyin một lát rồi mới vào buổi nói: câu mở đầu chỉ đọc pinyin lúc khởi tạo.
    body = <p role="status" className="text-body-md text-on-surface-variant">Đang chuẩn bị…</p>;
  } else {
    body = <RoleplayChat scenario={PET_SCENARIO} level={level} openingPinyin={openingPinyin || undefined} typingOnly={mic !== "ok"} tone={tone} onExit={onClose} exitLabel="Xong" summaryModal />;
  }
  return (
    <div className="basis-full rounded-2xl bg-surface-container-low p-space-sm" role="group" aria-label={`Nói chuyện với ${name}`}>
      {body}
      <button type="button" onClick={onClose} className="cursor-pointer mt-2 min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container-high">Đóng</button>
    </div>
  );
}
