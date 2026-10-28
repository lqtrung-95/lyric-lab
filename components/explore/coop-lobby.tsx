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
    if (c) router.push(`/explore/coop/${newCoopCode()}/play/a/${c.id}/${c.startScene}`);
  }
  function join() {
    const p = parseCoopLink(link);
    if (!p) { setError(true); return; }
    router.push(`/explore/coop/${p.code}/${p.caseId}/${p.sceneId}`);
  }

  return (
    <div className="flex flex-col gap-space-md">
      <section aria-labelledby="coop-how" className="card-ink flex flex-col gap-space-sm bg-secondary-container p-space-md text-on-secondary-container">
        <h2 id="coop-how" className="text-headline-md">Cách chơi cùng bạn</h2>
        <ol className="list-decimal space-y-1 pl-5 text-body-md">
          <li>Mỗi người phụ trách một nửa số cảnh: chỉ bạn hỏi được nhân vật và tìm manh mối ở cảnh của mình.</li>
          <li>Manh mối bạn tìm là <strong>riêng của bạn</strong>. Mở Sổ vụ án và bấm &quot;Báo cho đồng đội&quot;: họ đọc câu tiếng Trung rồi mới ghi vào sổ của họ.</li>
          <li>Hai người nói chuyện bằng câu tiếng Trung soạn từ mẫu (ví dụ &quot;我在医院。&quot;).</li>
          <li>Buộc tội cần cả hai: một người đề nghị, người kia đọc bằng chứng và đồng ý thì mới chấm.</li>
        </ol>
        <p className="text-label-md font-bold">Phá án xong cùng nhau: XP nhân 1,5 và mở huy hiệu &quot;Cặp thám tử&quot;, &quot;Bạn đồng hành&quot;.</p>
      </section>
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
