"use client";

import { useCallback, useState } from "react";
import type { LineExplanation } from "@/lib/lookup/explain-line-schema";

export type LineExplainResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; value: LineExplanation }
  | { status: "error"; reason: "rate_limited" | "error" };

/** Gọi /api/explain-line cho một câu, giữ trạng thái tải/kết quả/lỗi để nút Giải thích dùng lại được nhiều lần. */
export function useLineExplain(videoId: string) {
  const [result, setResult] = useState<LineExplainResult>({ status: "idle" });

  const explain = useCallback(async (lineIndex: number) => {
    setResult({ status: "loading" });
    try {
      const res = await fetch("/api/explain-line", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, lineIndex }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setResult({ status: "error", reason: body?.error === "rate_limited" ? "rate_limited" : "error" });
        return;
      }
      setResult({ status: "ok", value: await res.json() });
    } catch {
      setResult({ status: "error", reason: "error" });
    }
  }, [videoId]);

  const reset = useCallback(() => setResult({ status: "idle" }), []);

  return { result, explain, reset };
}
