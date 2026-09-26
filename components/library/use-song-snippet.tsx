"use client";

import { useCallback, useRef, useState } from "react";
import { SnippetPlayer, type SnippetRequest } from "@/components/player/snippet-player";
import { shiftLines } from "@/lib/listen/lyric-offset";
import { snippetRange } from "@/lib/preview/preview-format";
import { fetchReviewContext } from "@/lib/review/review-context-client";
import type { ReviewContext } from "@/lib/review/review-context-types";
import { readLyricOffset } from "@/lib/user-state/use-lyric-offset";

/**
 * Nghe đúng đoạn hát chứa một từ đã lưu, ngay trong danh sách. Câu hát lấy qua API ngữ cảnh (chỉ trả dòng người dùng có thẻ)
 * và giữ lại theo từng bài để bấm lại không phải tải lần nữa; mốc thời gian đã cộng độ lệch lời người dùng chỉnh.
 * `error` khác null khi bài đã bị gỡ hoặc không tìm thấy câu.
 */
export function useSongSnippet() {
  const contexts = useRef(new Map<string, ReviewContext | null>());
  const [active, setActive] = useState<{ videoId: string; request: SnippetRequest } | null>(null);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const play = useCallback(async (item: { key: string; videoId: string; lineIndex: number; term: string }) => {
    setError(null);
    setLoadingKey(item.key);
    if (!contexts.current.has(item.videoId)) contexts.current.set(item.videoId, await fetchReviewContext(item.videoId));
    setLoadingKey(null);
    const line = contexts.current.get(item.videoId)?.lines[item.lineIndex];
    if (!line) return setError(`Không tìm thấy câu hát chứa “${item.term}” (bài có thể đã bị gỡ).`);
    const range = snippetRange(shiftLines([line], readLyricOffset(item.videoId))[0]);
    setActive((prev) => ({ videoId: item.videoId, request: { nonce: (prev?.request.nonce ?? 0) + 1, label: item.term, ...range } }));
  }, []);

  const player = active && <SnippetPlayer key={active.videoId} videoId={active.videoId} request={active.request} />;
  return { play, player, loadingKey, error };
}
