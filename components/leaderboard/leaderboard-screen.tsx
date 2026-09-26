"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { track } from "@/lib/analytics/track";
import { ModeTabs } from "@/components/review/mode-tabs";
import { formatTimeLeft } from "@/lib/leaderboard/week";
import { NicknameForm } from "./nickname-form";

type Scope = "week" | "all";
interface Entry { rank: number; nickname: string; points: number; isMe: boolean }
interface Data {
  entries: Entry[];
  me: { rank: number; points: number } | null;
  profile: { nickname: string; optedIn: boolean } | null;
  weekEndsAt: string;
  loadedAt: number;
}

const TABS: { id: Scope; label: string }[] = [{ id: "week", label: "Tuần này" }, { id: "all", label: "Mọi thời gian" }];
const fmt = (n: number) => n.toLocaleString("vi-VN");

/** Bảng xếp hạng luyện tập (tuần này / mọi thời gian). Chỉ hiện biệt danh và điểm của người đã tự nguyện tham gia. */
export function LeaderboardScreen() {
  const [scope, setScope] = useState<Scope>("week");
  const [data, setData] = useState<Data | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState(false);

  const [reload, setReload] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/leaderboard?scope=${scope}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("bad status"))))
      .then((json: Omit<Data, "loadedAt">) => { if (!cancelled) { setData({ ...json, loadedAt: Date.now() }); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [scope, reload]);

  async function saveProfile(body: object): Promise<string | null> {
    if (!(await ensureAnonymousSession())) return "network";
    const res = await fetch("/api/leaderboard/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    if (!res) return "network";
    if (!res.ok) return ((await res.json().catch(() => ({}))) as { error?: string }).error ?? "server_error";
    setEditing(false);
    if ((body as { optedIn?: boolean }).optedIn) track("leaderboard_joined");
    setReload((n) => n + 1);
    return null;
  }

  const joined = data?.profile?.optedIn === true;
  const shown = data?.entries ?? [];
  const meOutside = data?.me && !shown.some((e) => e.isMe);

  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Bảng xếp hạng</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Tổng điểm từ các chế độ luyện tập. Chỉ biệt danh và điểm của người tự nguyện tham gia được hiển thị.</p>

        <section aria-label="Tham gia bảng xếp hạng" className="mt-space-md rounded-2xl bg-surface-container-low p-space-md">
          {data === null ? (
            <p className="text-body-md text-on-surface-variant">Đang tải…</p>
          ) : joined && !editing ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-body-md text-on-surface">Bạn đang tham gia với biệt danh <strong>{data.profile!.nickname}</strong>.</p>
              <div className="flex gap-1">
                <button type="button" onClick={() => setEditing(true)} className="min-h-11 rounded-full px-4 text-label-md font-medium text-primary hover:bg-surface-container">Đổi biệt danh</button>
                <button type="button" onClick={() => void saveProfile({ optedIn: false })} className="min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container">Rời bảng xếp hạng</button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-body-md text-on-surface">{joined ? "Đổi biệt danh của bạn." : "Bạn chưa tham gia. Đặt biệt danh để điểm của bạn xuất hiện trên bảng; bạn rời đi bất cứ lúc nào."}</p>
              <NicknameForm initial={data.profile?.nickname ?? ""} submitLabel={joined ? "Lưu biệt danh" : "Tham gia"} onSubmit={(nickname) => saveProfile({ optedIn: true, nickname })} onCancel={joined ? () => setEditing(false) : undefined} />
            </>
          )}
        </section>

        <div role="tablist" aria-label="Phạm vi xếp hạng" className="mt-space-md inline-flex gap-1 rounded-full bg-surface-container-low p-1">
          {TABS.map((t) => (
            <button key={t.id} type="button" role="tab" aria-selected={scope === t.id} onClick={() => { setData(null); setScope(t.id); }}
              className={`min-h-11 rounded-full px-5 text-label-md transition-colors ${scope === t.id ? "bg-surface-container-high font-medium text-on-surface" : "text-on-surface-variant hover:bg-surface-container-high"}`}>{t.label}</button>
          ))}
        </div>
        {scope === "week" && data && <p className="mt-2 text-label-md text-on-surface-variant">Bảng tuần reset sau {formatTimeLeft(Date.parse(data.weekEndsAt) - data.loadedAt)} (thứ Hai 00:00 giờ Việt Nam).</p>}

        {failed ? (
          <p role="alert" className="mt-space-md text-body-md text-error">Chưa tải được bảng xếp hạng. Thử lại sau nhé.</p>
        ) : data === null ? (
          <p role="status" className="mt-space-md text-body-md text-on-surface-variant">Đang tải bảng xếp hạng…</p>
        ) : shown.length === 0 ? (
          <p className="mt-space-md rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Chưa có ai trên bảng {scope === "week" ? "tuần này" : ""}. Chơi một lượt luyện tập và tham gia để dẫn đầu!</p>
        ) : (
          <ol aria-label="Xếp hạng" className="mt-space-md divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest shadow-sm">
            {shown.map((e) => <Row key={`${e.rank}-${e.nickname}`} entry={e} />)}
            {meOutside && (
              <>
                <li aria-hidden="true" className="px-4 py-1 text-center text-on-surface-variant">⋯</li>
                <Row entry={{ rank: data!.me!.rank, nickname: data!.profile?.nickname ?? "Bạn", points: data!.me!.points, isMe: true }} />
              </>
            )}
          </ol>
        )}
      </div>
    </>
  );
}

function Row({ entry }: { entry: Entry }) {
  const medal = entry.rank <= 3 ? ["bg-tertiary-fixed text-on-tertiary-fixed", "bg-surface-container-highest text-on-surface", "bg-primary-fixed text-on-primary-fixed"][entry.rank - 1] : "bg-surface-container text-on-surface-variant";
  return (
    <li aria-current={entry.isMe ? "true" : undefined} className={`flex items-center gap-3 px-4 py-3 ${entry.isMe ? "bg-secondary-container/40" : ""}`}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-label-md font-semibold ${medal}`}><span className="sr-only">Hạng </span>{entry.rank}</span>
      <span className="min-w-0 flex-1 truncate text-body-md font-medium text-on-surface">{entry.nickname}{entry.isMe && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-label-sm text-on-secondary">Bạn</span>}</span>
      <span className="shrink-0 font-serif text-headline-md text-primary">{fmt(entry.points)}<span className="sr-only"> điểm</span></span>
    </li>
  );
}
