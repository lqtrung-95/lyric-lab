"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { useYouTubePlayer } from "@/components/player/use-youtube-player";

const MAX_PLAYS = 2;

/**
 * Nghe đoạn của dòng đang hỏi (tối đa 2 lượt mỗi câu). Khung video LUÔN hiển thị (điều khoản YouTube: player nhúng phải nhìn thấy
 * được, không nhỏ hơn 200 px, không có chế độ chỉ âm thanh), nên nằm ngay trong thẻ câu hỏi chứ không ẩn. Phát chỉ bắt đầu từ lần bấm
 * của người dùng (autoplay bị trình duyệt chặn). Player được dựng một lần cho cả ván; mỗi câu chỉ đổi mốc và đặt lại số lượt.
 */
export function RoomClipPlayer({ videoId, questionIndex, start, end }: { videoId: string; questionIndex: number; start: number; end: number }) {
  const { containerRef, controller, failed } = useYouTubePlayer(videoId);
  const [state, setState] = useState({ index: questionIndex, plays: 0 });
  const plays = state.index === questionIndex ? state.plays : 0;
  const [token, setToken] = useState(0);

  useEffect(() => {
    if (!controller || token === 0) return;
    controller.playRange(start, end);
    const poll = setInterval(() => {
      if (controller.getCurrentTime() >= end) {
        controller.pause();
        clearInterval(poll);
      }
    }, 100);
    return () => clearInterval(poll);
  }, [controller, token, start, end]);

  function play() {
    if (!controller || plays >= MAX_PLAYS) return;
    setState({ index: questionIndex, plays: plays + 1 });
    setToken((t) => t + 1);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} className="aspect-video w-full max-w-[356px] overflow-hidden rounded-xl bg-inverse-surface [&_iframe]:h-full [&_iframe]:w-full" />
      {failed ? (
        <p role="status" className="text-label-md text-on-surface-variant">Không phát được video này (có thể chủ video tắt nhúng). Bạn vẫn trả lời được.</p>
      ) : (
        <button
          type="button" onClick={play} disabled={!controller || plays >= MAX_PLAYS}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-high px-5 text-label-md font-medium text-on-surface hover:bg-surface-container-highest disabled:opacity-50"
        >
          <Icon name="play_arrow" filled size={20} />
          {plays === 0 ? "Nghe câu này" : "Nghe lại"} <span className="text-on-surface-variant">(còn {MAX_PLAYS - plays} lượt)</span>
        </button>
      )}
    </div>
  );
}
