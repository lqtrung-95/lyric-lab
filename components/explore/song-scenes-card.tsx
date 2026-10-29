"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { loadProgress } from "@/lib/explore/explore-progress";
import { scenesForSong, songTermSet, type SongSceneMatch } from "@/lib/explore/song-scenes";

/**
 * Cầu nối bài hát → Khám phá: "bài này có N từ ở cảnh X, vào học tiếp". Dữ liệu cảnh (khá nặng) chỉ tải khi thẻ được vẽ, ở một gói riêng; tiến độ đọc từ
 * localStorage. Không có cảnh nào đủ từ trùng thì không hiện gì (không chiếm chỗ).
 */
export function SongScenesCard({ items, lines, className = "" }: { items: readonly PreviewItem[]; lines: readonly AnalyzedLine[]; className?: string }) {
  const [matches, setMatches] = useState<SongSceneMatch[] | null>(null);
  const [emoji, setEmoji] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    Promise.all([import("@/lib/explore/scenes"), import("@/lib/explore/town-layout")]).then(([{ SCENES }, { SCENE_EMOJI }]) => {
      if (!live) return;
      const found = scenesForSong(songTermSet(items, lines), Object.values(SCENES), loadProgress(window.localStorage));
      setEmoji(SCENE_EMOJI);
      setMatches(found);
    }).catch(() => { if (live) setMatches([]); });
    return () => { live = false; };
  }, [items, lines]);

  if (!matches || matches.length === 0) return null;
  return (
    <section aria-label="Học tiếp ở Khám phá" className={`card-ink flex flex-col gap-2 p-space-sm ${className}`}>
      <h2 className="flex items-center gap-2 text-label-lg font-extrabold"><span aria-hidden="true">🧭</span>Học tiếp ở Khám phá</h2>
      <p className="text-body-sm text-on-surface-variant">Bài này có từ trùng với các cảnh sau. Vào cảnh để chạm đồ vật, nghe và luyện những từ đó.</p>
      <ul className="flex flex-col gap-2">
        {matches.map((m) => (
          <li key={m.sceneId}>
            <Link href={`/explore/${m.sceneId}`} className="flex min-h-14 items-center gap-3 rounded-xl border-2 border-ink bg-surface-container-lowest p-2 hover:bg-surface-container-low">
              <span aria-hidden="true" className="text-2xl">{emoji[m.sceneId] ?? "🏙️"}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-label-lg font-extrabold">{m.title}</span>
                <span lang="zh" className="block truncate text-body-md">{m.terms.join("、")}</span>
                <span className="block text-label-md text-on-surface-variant">{m.terms.length} từ trùng với bài{m.unlearned.length > 0 ? `, ${m.unlearned.length} từ bạn chưa học` : ", bạn đã học hết"}</span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-lg font-bold text-primary">›</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
