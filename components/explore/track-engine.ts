import type { MusicTrack } from "@/lib/explore/music-tracks";
import type { AmbientMusic } from "./ambient-engine";

const POS_KEY = (id: string) => `songhanzi-explore-music-pos:${id}`;
const DUCK_FACTOR = 0.25;
const FADE_MS = 1200;

/**
 * Phát một bài nhạc có sẵn, lặp lại. Vị trí đang phát được nhớ theo phiên (sessionStorage) nên sang cảnh khác dùng cùng bài thì nhạc tiếp tục chứ không phát lại từ đầu.
 * Vào bài và tắt dần bằng cách tăng/giảm `volume`. `onError` được gọi nếu không tải/phát được (để rơi về nhạc thuật toán). Phải gọi sau thao tác của người dùng.
 */
export function startTrackMusic(track: MusicTrack, onError: () => void): AmbientMusic {
  const audio = new Audio(track.src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0;
  let ducked = false;
  let paused = false;
  let stopped = false;
  let current = 0; // độ to đang đặt, đi dần tới mục tiêu
  const target = () => (ducked ? track.volume * DUCK_FACTOR : track.volume);

  try {
    const saved = Number(window.sessionStorage.getItem(POS_KEY(track.id)));
    if (Number.isFinite(saved) && saved > 0) audio.currentTime = saved;
  } catch { /* không đọc được thì phát từ đầu */ }

  // Đi dần độ to tới mục tiêu (vào nhạc, hạ khi có giọng đọc, tắt dần).
  const ramp = setInterval(() => {
    const goal = stopped ? 0 : target();
    const step = (track.volume * 50) / FADE_MS;
    current = Math.abs(goal - current) <= step ? goal : current + Math.sign(goal - current) * step;
    audio.volume = Math.min(1, Math.max(0, current));
    if (stopped && current === 0) { clearInterval(ramp); audio.pause(); }
  }, 50);

  audio.addEventListener("error", () => { if (!stopped) { stopped = true; clearInterval(ramp); onError(); } });
  void audio.play().catch(() => { if (!stopped) { stopped = true; clearInterval(ramp); onError(); } });

  return {
    setDucked: (d) => { ducked = d; },
    setPaused: (p) => { paused = p; if (p) audio.pause(); else if (!stopped && !paused) void audio.play().catch(() => undefined); },
    stop: () => {
      try { window.sessionStorage.setItem(POS_KEY(track.id), String(audio.currentTime)); } catch { /* bỏ qua */ }
      stopped = true;
    },
  };
}
