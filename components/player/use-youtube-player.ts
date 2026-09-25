"use client";

import { useEffect, useRef, useState } from "react";
import { loadYouTubeIframeApi } from "@/lib/youtube/youtube-iframe-api";

/** Điều khiển player, tách khỏi kiểu của YouTube để dùng chung cho xem trước và màn Nghe. */
export interface PlayerController {
  playRange(start: number, end: number): void;
  play(): void;
  pause(): void;
  seekTo(seconds: number): void;
  setRate(rate: number): void;
  getCurrentTime(): number;
  isPlaying(): boolean;
}

/** Tạo YouTube player bên trong `containerRef`. Trả về controller khi player sẵn sàng (null trước đó hoặc khi lỗi). */
export function useYouTubePlayer(videoId: string, enabled = true) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [controller, setController] = useState<PlayerController | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let player: YT.Player | null = null;
    let cancelled = false;

    loadYouTubeIframeApi()
      .then((api) => {
        if (cancelled || !containerRef.current) return;
        // YouTube thay phần tử bằng iframe, nên tạo một phần tử con riêng để React không bị mất tham chiếu.
        const mount = document.createElement("div");
        containerRef.current.appendChild(mount);
        player = new api.Player(mount, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, origin: window.location.origin },
          events: {
            onReady: (e) => {
              if (cancelled) return;
              const p = e.target;
              setController({
                playRange: (start) => { p.seekTo(start, true); p.playVideo(); },
                play: () => p.playVideo(),
                pause: () => p.pauseVideo(),
                seekTo: (s) => p.seekTo(s, true),
                setRate: (r) => p.setPlaybackRate(r),
                getCurrentTime: () => p.getCurrentTime(),
                isPlaying: () => p.getPlayerState() === api.PlayerState.PLAYING,
              });
            },
            onError: () => setFailed(true),
          },
        });
      })
      .catch(() => !cancelled && setFailed(true));

    return () => {
      cancelled = true;
      setController(null);
      player?.destroy();
    };
  }, [videoId, enabled]);

  return { containerRef, controller, failed };
}
