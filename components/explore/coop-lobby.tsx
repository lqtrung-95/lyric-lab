"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { newCoopCode, parseCoopLink } from "@/lib/explore/coop/coop-state";
import type { StoryDifficulty } from "@/lib/explore/story/story-types";
import { DifficultyBadge } from "./story/difficulty-badge";

interface LobbyCase { id: string; title: string; difficulty: StoryDifficulty; blurb: string; startScene: string }

/** Sảnh chơi chung: chọn vụ án và tạo phòng (người tạo là Thám tử A), hoặc dán liên kết mời để vào (Thám tử B). */
export function CoopLobby({ cases }: { cases: LobbyCase[] }) {
  const router = useRouter();
  const [picked, setPicked] = useState(cases[0]?.id ?? "");
  const [link, setLink] = useState("");
  const [error, setError] = useState(false);

  function create() {
    const c = cases.find((x) => x.id === picked);
    if (c) router.push(`/explore/coop/${newCoopCode()}/${c.id}/${c.startScene}?r=a`);
  }
  function join() {
    const p = parseCoopLink(link);
    if (!p) { setError(true); return; }
    router.push(`/explore/coop/${p.code}/${p.caseId}/${p.sceneId}`);
  }

  return (
    <div className="flex flex-col gap-space-md">
      <section aria-labelledby="coop-create" className="card-ink flex flex-col gap-space-sm p-space-md">
        <h2 id="coop-create" className="text-headline-md">Tạo phòng</h2>
        <fieldset className="flex flex-col gap-1.5">
          <legend className="sr-only">Chọn vụ án</legend>
          {cases.map((c) => (
            <label key={c.id} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 ${picked === c.id ? "border-ink bg-primary-container" : "border-outline-variant"}`}>
              <input type="radio" name="coop-case" value={c.id} checked={picked === c.id} onChange={() => setPicked(c.id)} className="size-4 accent-[var(--color-primary)]" />
              <span className="min-w-0 flex-1">
                <span className="block text-label-lg font-extrabold">{c.title}</span>
                <span className="block text-label-md text-on-surface-variant">{c.blurb}</span>
              </span>
              <DifficultyBadge level={c.difficulty} />
            </label>
          ))}
        </fieldset>
        <Button3d variant="secondary" onClick={create}>Tạo phòng và lấy liên kết mời</Button3d>
        <p className="text-label-md text-on-surface-variant">Vào phòng rồi bấm &quot;Chép liên kết mời bạn&quot; và gửi cho bạn bè (cùng đăng nhập hay chơi khách đều được).</p>
      </section>

      <section aria-labelledby="coop-join" className="card-ink flex flex-col gap-space-sm p-space-md">
        <h2 id="coop-join" className="text-headline-md">Vào phòng của bạn</h2>
        <label className="flex flex-col gap-1 text-label-md font-bold">
          Dán liên kết mời
          <input value={link} onChange={(e) => { setLink(e.target.value); setError(false); }} placeholder="https://…/explore/coop/ABC234/…"
            className="min-h-11 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-md font-normal" />
        </label>
        {error && <p role="alert" className="text-label-md font-bold text-error">Liên kết chưa đúng. Hãy dán đúng liên kết bạn bè gửi.</p>}
        <Button3d variant="primary" onClick={join} disabled={!link.trim()}>Vào phòng</Button3d>
      </section>
    </div>
  );
}
