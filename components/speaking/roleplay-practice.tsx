"use client";

import { useState } from "react";
import { useChatAccount } from "@/components/chat/use-chat-account";
import { signInGoogle } from "@/lib/auth/account-client";
import { SCENARIOS, type Scenario } from "@/lib/roleplay/scenarios";
import type { MicCheck } from "@/lib/speaking/vad-recorder";
import { MicIntro } from "./mic-intro";
import { RoleplayChat } from "./roleplay-chat";

const LEVELS = [1, 2, 3, 4];

/** Trang Trò chuyện tự do: chỉ tài khoản đã đăng nhập; chọn tình huống + trình độ HSK 1–4, xin quyền micro, rồi vào buổi nói. `openingPinyin` lấy từ từ điển ở server. */
export function RoleplayPractice({ openingPinyin }: { openingPinyin: Record<string, string> }) {
  const registered = useChatAccount();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [level, setLevel] = useState(2);
  const [mic, setMic] = useState<MicCheck | null>(null);
  const [run, setRun] = useState(0);

  if (registered === undefined) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang kiểm tra tài khoản…</p>;
  if (!registered) {
    return (
      <div className="rounded-2xl bg-surface-container-low p-space-lg text-center">
        <p className="text-body-lg font-bold">Trò chuyện với AI cần đăng nhập Google</p>
        <p className="mt-1 text-body-md text-on-surface-variant">Mỗi lượt nói dùng AI nên chỉ mở cho tài khoản đã đăng ký (tối đa 20 lượt mỗi ngày). Các bài Hỏi nhanh – Đáp nhanh và Dùng 5 từ vẫn dùng không cần tài khoản.</p>
        <button type="button" onClick={() => void signInGoogle()} className="mt-space-md min-h-12 rounded-full bg-primary px-6 text-label-lg font-bold text-on-primary hover:brightness-110">Đăng nhập bằng Google</button>
      </div>
    );
  }
  if (scenario && mic !== null) {
    return <RoleplayChat key={run} scenario={scenario} level={level} openingPinyin={openingPinyin[scenario.opening.zh]} typingOnly={mic !== "ok"} onExit={() => { setScenario(null); setMic(null); setRun((r) => r + 1); }} />;
  }
  if (scenario) return <MicIntro title={`${scenario.emoji} ${scenario.title}`} onStart={setMic} steps={[`Mục tiêu: ${scenario.goal}.`, "AI mở lời, rồi micro tự bật: bạn nói câu trả lời của mình, không có kịch bản.", "Sau mỗi lượt AI đáp, có gợi ý sửa nhẹ nếu bạn nói chưa chuẩn. Tối đa 8 lượt."]} />;
  return (
    <div className="flex flex-col gap-space-md">
      <fieldset>
        <legend className="text-label-lg font-extrabold">Trình độ của AI</legend>
        <div className="mt-1 flex gap-2">
          {LEVELS.map((l) => (
            <button key={l} type="button" aria-pressed={level === l} onClick={() => setLevel(l)} className={`min-h-11 rounded-full border-2 border-ink px-5 text-label-md font-extrabold ${level === l ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>HSK {l}</button>
          ))}
        </div>
      </fieldset>
      <ul className="grid auto-rows-fr gap-3 sm:grid-cols-2">
        {SCENARIOS.filter((s) => !s.hidden).map((s) => (
          <li key={s.id} className="flex">
            <button type="button" onClick={() => setScenario(s)} className="flex min-h-20 w-full items-center gap-3 rounded-xl border-2 border-ink bg-surface-container-lowest p-space-sm text-left hover:bg-surface-container-low">
              <span aria-hidden className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-2xl">{s.emoji}</span>
              <span className="min-w-0"><span className="block text-label-lg font-extrabold">{s.title}</span><span className="block text-body-sm text-on-surface-variant">{s.goal}</span></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
