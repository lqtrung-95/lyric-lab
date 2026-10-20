"use client";

import { useEffect, useState } from "react";
import { MAX_WEAK_SENT, readWeakTerms } from "@/lib/courses/weak-terms";
import type { UnitDetail } from "@/lib/courses/unit-types";

export type UnitState = { status: "loading" } | { status: "not_found" } | { status: "error" } | { status: "ready"; detail: UnitDetail };

/** Tải nội dung một chặng từ `/api/courses/[slug]/[idx]`. */
export function useUnit(slug: string, idx: number): UnitState {
  const [state, setState] = useState<UnitState>({ status: "loading" });
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/courses/${slug}/${idx}`).then(async (res) => {
      if (cancelled) return;
      if (res.status === 404 || res.status === 400) return setState({ status: "not_found" });
      if (!res.ok) return setState({ status: "error" });
      const detail = (await res.json()) as UnitDetail;
      setState({ status: "ready", detail });
      // Chặng ôn tổng hợp: nếu người học có từ hay sai thì xin lại đề có ưu tiên các từ đó (chặng học thì không cần, để còn dùng được bộ nhớ đệm).
      const weak = detail.unit.kind === "hsk" ? [] : readWeakTerms().slice(0, MAX_WEAK_SENT);
      if (weak.length === 0) return;
      const again = await fetch(`/api/courses/${slug}/${idx}?weak=${encodeURIComponent(weak.join(","))}`);
      if (!cancelled && again.ok) setState({ status: "ready", detail: (await again.json()) as UnitDetail });
    }).catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [slug, idx]);
  return state;
}
