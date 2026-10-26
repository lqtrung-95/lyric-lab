import type { SceneStory } from "./story-types";

/** Viết truyện gọn: tiêu đề [Hán, Việt], các dòng [Hán, Việt], và câu hỏi hiểu bài [hỏi Việt, đáp án đúng, đáp án sai 1, đáp án sai 2]. */
export function story(title: [string, string], lines: [string, string][], q: [string, string, string, string]): SceneStory {
  return {
    title: { zh: title[0], vi: title[1] },
    lines: lines.map(([zh, vi]) => ({ zh, vi })),
    question: { vi: q[0], right: q[1], wrong: [q[2], q[3]] },
  };
}
