"use client";

import { useEffect, useRef, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { TermEntry } from "@/lib/lookup/build-term-entry";
import type { TermExplanation } from "@/lib/lookup/explain-schema";
import { fetchExplanation, fetchTermEntry, type FetchResult } from "@/lib/lookup/lookup-client";
import type { WordSelection } from "./lyric-line-row";

export interface LookupState {
  /** undefined = đang tải. */
  entry?: FetchResult<TermEntry | null>;
  meaning?: FetchResult<TermExplanation>;
}

const keyOf = (videoId: string, w: WordSelection) => `${videoId}|${w.lineIndex}|${w.term}`;

/**
 * Tra một từ vừa được bấm: từ điển (nhanh) và nghĩa theo ngữ cảnh (LLM) chạy song song, mỗi phần hiện ngay khi có
 * (LS-06). Từ đã thuộc danh sách học (có itemId) dùng dữ liệu sẵn có nên không gọi mạng. Kết quả giữ lại theo từ
 * để bấm lại tức thì.
 */
export function useTermLookup(videoId: string, word: WordSelection | null): LookupState {
  const [results, setResults] = useState<Record<string, LookupState>>({});
  const started = useRef(new Set<string>());
  const key = word && !word.itemId ? keyOf(videoId, word) : null;

  useEffect(() => {
    const startedKeys = started.current;
    if (!word || !key || startedKeys.has(key)) return;
    startedKeys.add(key);
    const controller = new AbortController();
    let pending = 2;
    const settle = () => { pending -= 1; };
    const patch = (p: Partial<LookupState>) => {
      settle();
      if (!controller.signal.aborted) setResults((r) => ({ ...r, [key]: { ...r[key], ...p } }));
    };
    fetchTermEntry(word.term, controller.signal).then((entry) => patch({ entry }));
    // Giải nghĩa bằng LLM tính hạn mức theo tài khoản nên cần phiên (thường đã có từ trang trước).
    ensureAnonymousSession()
      .then(() => fetchExplanation({ videoId, lineIndex: word.lineIndex, term: word.term }, controller.signal))
      .then((meaning) => patch({ meaning }));
    return () => {
      // Đổi từ khi còn yêu cầu dở dang: bỏ chúng và cho phép tra lại lần sau. Đã xong hết thì giữ kết quả.
      if (pending > 0) {
        controller.abort();
        startedKeys.delete(key);
      }
    };
  }, [word, key, videoId]);

  return (key && results[key]) || {};
}
