"use client";

import { useEffect, useState } from "react";
import { loadProgress } from "@/lib/explore/explore-progress";
import { learnedTerms } from "@/lib/explore/learned-terms";
import { SCENES } from "@/lib/explore/scenes/room-scene";

const NONE: ReadonlySet<string> = new Set();

/**
 * Từ đã học ở cảnh Khám phá (đọc từ localStorage sau khi trang hiện, nên lần vẽ đầu rỗng để không lệch với bản dựng trên server).
 * Cầu nối sang bài nghe: lời bài hát/video đánh dấu các từ này. Trả về cùng một đối tượng giữa các lần vẽ để dòng lời (memo) không vẽ lại.
 */
export function useExploreLearnedTerms(): ReadonlySet<string> {
  const [terms, setTerms] = useState<ReadonlySet<string>>(NONE);
  useEffect(() => {
    try {
      const learned = learnedTerms(loadProgress(window.localStorage), Object.values(SCENES));
      // Đọc kho lưu của trình duyệt sau khi mount (server không có localStorage) nên cần setState trong effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (learned.size > 0) setTerms(learned);
    } catch { /* không đọc được: không đánh dấu */ }
  }, []);
  return terms;
}
