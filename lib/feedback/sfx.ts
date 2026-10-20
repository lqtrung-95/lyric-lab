import { isChineseAudioBusy } from "@/lib/speech/play-chinese";
import { sfxNotes, type SfxKind } from "./sfx-notes";

export const SFX_KEY = "lyric-lab-sfx";
const CHANGE_EVENT = "songhanzi:sfx-change";
const MOBILE_UA = /Android|iPhone|iPad|iPod|Mobile/i;

/**
 * Âm thanh hiệu ứng (đúng/sai/qua chặng). Mặc định BẬT trên máy tính, TẮT trên điện thoại (hay học ở nơi đông người); người dùng đổi được ở Cài đặt và lựa chọn đó thắng mặc định.
 * Lỗi đọc localStorage thì dùng mặc định theo thiết bị.
 */
export function readSfxEnabled(): boolean {
  try {
    const v = localStorage.getItem(SFX_KEY);
    if (v === "on") return true;
    if (v === "off") return false;
  } catch { /* dùng mặc định */ }
  return typeof navigator !== "undefined" && !MOBILE_UA.test(navigator.userAgent);
}

export function writeSfxEnabled(on: boolean): void {
  try { localStorage.setItem(SFX_KEY, on ? "on" : "off"); } catch { /* không lưu được: chỉ đổi trong phiên này */ }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeSfx(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(CHANGE_EVENT, onChange); window.removeEventListener("storage", onChange); };
}

let ctx: AudioContext | null = null;

/**
 * Phát một hiệu ứng. Bỏ qua khi: đang tắt, tab không hiển thị, hoặc đang có giọng đọc tiếng Trung (tránh lẫn với giọng mẫu). Chỉ gọi sau thao tác của người dùng
 * (trình duyệt chặn tự phát); mọi lỗi âm thanh đều nuốt im vì đây chỉ là phần thưởng thêm.
 */
export function playSfx(kind: SfxKind): void {
  try {
    if (!readSfxEnabled() || document.visibilityState === "hidden" || isChineseAudioBusy()) return;
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    const t0 = ctx.currentTime;
    for (const n of sfxNotes(kind)) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type;
      osc.frequency.value = n.freq;
      // Vào/ra nhanh để không bị tiếng "tách" ở đầu và cuối nốt.
      gain.gain.setValueAtTime(0, t0 + n.at);
      gain.gain.linearRampToValueAtTime(n.gain, t0 + n.at + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.02);
    }
  } catch { /* âm thanh là phần thưởng thêm: lỗi thì thôi */ }
}
