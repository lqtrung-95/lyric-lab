"use client";

import { useCallback, useEffect, useState } from "react";
import { listLikedLessonIds } from "@/lib/user-data/video-likes-repo";

const NUDGE_KEY = "lyric-lab-video-like-nudge";
const NUDGE_MESSAGE = "Đã thêm vào Yêu thích. Đăng nhập Google (ở Cài đặt) để giữ danh sách này trên mọi thiết bị.";

const nudgeShown = (): boolean => { try { return localStorage.getItem(NUDGE_KEY) === "1"; } catch { return true; } };
const markNudgeShown = () => { try { localStorage.setItem(NUDGE_KEY, "1"); } catch { /* không ghi được: chỉ lặp lại lời nhắc ở lần sau */ } };

/**
 * Tập videoId video luyện nghe người dùng đã thích (tải một lần lúc mount); `setLiked` cập nhật cục bộ khi bấm tim (nút đã cập nhật lạc quan).
 * Lần thích ĐẦU TIÊN của người chưa đăng nhập Google (tài khoản ẩn danh, danh sách nằm theo trình duyệt) có thêm lời nhắc đăng nhập để không mất danh sách; chỉ nhắc một lần.
 */
export function useLikedVideos() {
  const [liked, setLikedIds] = useState<Set<string>>(new Set());
  const [nudge, setNudge] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listLikedLessonIds().then((ids) => { if (!cancelled) setLikedIds(new Set(ids)); });
    return () => { cancelled = true; };
  }, []);

  const maybeNudge = useCallback(async () => {
    if (nudgeShown()) return;
    try {
      const registered = ((await (await fetch("/api/chat/me", { cache: "no-store" })).json()) as { registered?: boolean }).registered;
      if (registered === false) { markNudgeShown(); setNudge(NUDGE_MESSAGE); }
    } catch { /* không biết trạng thái tài khoản: bỏ qua lời nhắc */ }
  }, []);

  const setLiked = useCallback((videoId: string, value: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(videoId); else next.delete(videoId);
      return next;
    });
    if (value) void maybeNudge();
  }, [maybeNudge]);

  const clearNudge = useCallback(() => setNudge(null), []);
  return { liked, setLiked, nudge, clearNudge };
}
