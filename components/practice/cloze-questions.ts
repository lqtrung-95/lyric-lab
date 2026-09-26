"use client";

import { useEffect, useState } from "react";
import { fetchReviewContext } from "@/lib/review/review-context-client";
import type { ReviewLine } from "@/lib/review/review-context-types";
import type { ReviewCard } from "@/lib/user-data/review-repo";

export interface ClozeCandidate {
  card: ReviewCard;
  line: ReviewLine;
  videoId: string;
  /** Tên bài (từ API ngữ cảnh) để hiện ở danh sách chọn bài của Karaoke. */
  title: string;
  lineIndex: number;
}

/**
 * Ghép thẻ với câu hát chứa nó (lấy qua API ngữ cảnh, chỉ trả những dòng người dùng có thẻ). Thẻ không có bài nguồn, bài đã bị
 * gỡ hoặc từ không nằm trong câu thì bị bỏ. `undefined` khi đang tải.
 */
export function useClozeCandidates(cards: ReviewCard[]): ClozeCandidate[] | undefined {
  const [result, setResult] = useState<{ key: string; list: ClozeCandidate[] } | null>(null);
  const withSource = cards.filter((c) => c.kind === "vocab" && c.video_id && c.line_index !== null);
  const key = withSource.map((c) => c.item_key).join("|");

  useEffect(() => {
    let cancelled = false;
    const videoIds = [...new Set(withSource.map((c) => c.video_id as string))];
    Promise.all(videoIds.map(async (id) => [id, await fetchReviewContext(id)] as const)).then((entries) => {
      if (cancelled) return;
      const contexts = new Map(entries);
      const list = withSource.flatMap((card) => {
        const ctx = contexts.get(card.video_id as string);
        const line = ctx?.lines[card.line_index as number];
        return line && line.text.includes(card.term)
          ? [{ card, line, videoId: card.video_id as string, title: ctx?.title ?? "", lineIndex: card.line_index as number }]
          : [];
      });
      setResult({ key, list });
    });
    return () => { cancelled = true; };
    // `withSource` được suy ra từ `cards`; `key` đại diện cho nội dung của nó.
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return result?.key === key ? result.list : undefined;
}
