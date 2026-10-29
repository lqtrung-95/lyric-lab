"use client";

import { useCallback } from "react";
import { useLocalJson } from "@/components/pet/use-local-json-store";
import { EMPTY_STATS, GRAMMAR_STATS_EVENT, GRAMMAR_STATS_KEY, parseGrammarStats, recordAnswer, type GrammarStats } from "@/lib/grammar/grammar-stats";

/** Thống kê đúng/sai theo mẫu ngữ pháp, lưu ở thiết bị này (bản đồ lỗi cá nhân). */
export function useGrammarStats() {
  const [stats, write] = useLocalJson<GrammarStats>(GRAMMAR_STATS_KEY, GRAMMAR_STATS_EVENT, parseGrammarStats, EMPTY_STATS);
  const record = useCallback((patternId: string, correct: boolean) => {
    let cur: GrammarStats = EMPTY_STATS;
    try { cur = parseGrammarStats(JSON.parse(localStorage.getItem(GRAMMAR_STATS_KEY) ?? "null")); } catch { /* đọc lỗi thì bắt đầu lại */ }
    write(recordAnswer(cur, patternId, correct, Date.now()));
  }, [write]);
  return { stats, record };
}
