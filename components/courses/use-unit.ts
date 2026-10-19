"use client";

import { useEffect, useState } from "react";
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
      setState({ status: "ready", detail: (await res.json()) as UnitDetail });
    }).catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [slug, idx]);
  return state;
}
