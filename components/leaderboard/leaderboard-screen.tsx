"use client";

import { useEffect, useState } from "react";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { track } from "@/lib/analytics/track";
import { Icon } from "@/components/ui/icon";
import { ModeTabs } from "@/components/review/mode-tabs";
import { formatTimeLeft } from "@/lib/leaderboard/week";
import { AvatarCircle } from "./avatar-circle";
import { AvatarUploader } from "./avatar-uploader";
import { NicknameForm } from "./nickname-form";

type Scope = "week" | "all";
interface Entry { rank: number; nickname: string; points: number; avatarUrl: string | null; isMe: boolean }
interface Data {
  entries: Entry[];
  me: { rank: number; points: number } | null;
  profile: { nickname: string; optedIn: boolean; avatarUrl: string | null } | null;
  weekEndsAt: string;
  loadedAt: number;
}

const TABS: { id: Scope; label: string }[] = [{ id: "week", label: "Tuần này" }, { id: "all", label: "Mọi thời gian" }];
const fmt = (n: number) => n.toLocaleString("vi-VN");

/** Bảng xếp hạng luyện tập (tuần này / mọi thời gian): bục 3 hạng đầu, rồi danh sách. Chỉ hiện biệt danh, ảnh đại diện và điểm của người tự nguyện tham gia. */
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
  // Bục chỉ đẹp khi có ít nhất 2 người để so sánh; 1 người thì hiện dạng danh sách thường như bình thường.
  const useTop3Podium = shown.length >= 2;
  const podium = useTop3Podium ? shown.slice(0, 3) : [];
  const rest = useTop3Podium ? shown.slice(3) : shown;
  const meOutside = data?.me && !shown.some((e) => e.isMe);

  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Bảng xếp hạng</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Tổng điểm từ các chế độ luyện tập. Chỉ biệt danh, ảnh đại diện và điểm của người tự nguyện tham gia được hiển thị.</p>

        <section aria-label="Tham gia bảng xếp hạng" className="mt-space-md rounded-2xl bg-surface-container-low p-space-md">
          {data === null ? (
            <p className="text-body-md text-on-surface-variant">Đang tải…</p>
          ) : joined && !editing ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AvatarUploader
                  nickname={data.profile!.nickname} avatarUrl={data.profile!.avatarUrl}
                  onUploaded={() => setReload((n) => n + 1)}
                />
                <p className="text-body-md text-on-surface">Bạn đang tham gia với biệt danh <strong>{data.profile!.nickname}</strong>.</p>
              </div>
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
          <>
            {podium.length > 0 && <Podium entries={podium} />}
            {rest.length > 0 && (
              <ol aria-label="Xếp hạng từ #4" className="mt-space-md divide-y divide-surface-container-high rounded-2xl bg-surface-container-lowest shadow-sm">
                {rest.map((e) => <Row key={e.rank} entry={e} />)}
              </ol>
            )}
            {meOutside && (
              <>
                <p className="mt-space-md text-center text-label-sm uppercase tracking-wider text-on-surface-variant">Vị trí của bạn</p>
                <ol aria-label="Vị trí của bạn" className="mt-1 rounded-2xl bg-surface-container-lowest shadow-sm">
                  <Row entry={{ rank: data!.me!.rank, nickname: data!.profile?.nickname ?? "Bạn", points: data!.me!.points, avatarUrl: data!.profile?.avatarUrl ?? null, isMe: true }} />
                </ol>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

function Podium({ entries }: { entries: Entry[] }) {
  // Thứ tự trưng bày trái→phải: hạng 2, hạng 1 (giữa, nhô cao), hạng 3 — không phải thứ tự hạng.
  const display = [entries[1], entries[0], entries[2]].filter((e): e is Entry => e !== undefined);
  return (
    <div className="mt-space-md grid grid-cols-3 items-end gap-2 sm:gap-3">
      {display.map((e) => {
        const first = e.rank === 1;
        return (
          <div
            key={e.rank}
            className={`flex flex-col items-center gap-2 rounded-2xl p-space-sm text-center shadow-sm ${
              first ? "bg-primary-container pb-space-md pt-space-md" : "bg-surface-container-low pb-space-sm pt-space-sm"
            }`}
          >
            <Icon name={first ? "star" : "verified"} filled size={first ? 26 : 20} className={first ? "text-primary" : "text-on-surface-variant"} />
            <AvatarCircle nickname={e.nickname} avatarUrl={e.avatarUrl} size={first ? 72 : 56} />
            <p className={`line-clamp-1 max-w-full text-label-md font-semibold ${first ? "text-on-primary-container" : "text-on-surface"}`}>{e.nickname}</p>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-semibold ${first ? "bg-surface-container-lowest text-primary" : "bg-surface-container-high text-on-surface-variant"}`}>
              {fmt(e.points)}<span className="sr-only"> điểm</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Row({ entry }: { entry: Entry }) {
  return (
    <li aria-current={entry.isMe ? "true" : undefined} className={`flex items-center gap-3 px-4 py-3 ${entry.isMe ? "bg-secondary-container/40" : ""}`}>
      <span className="w-9 shrink-0 text-center font-mono text-label-md font-semibold text-on-surface-variant"><span className="sr-only">Hạng </span>{entry.rank}</span>
      <AvatarCircle nickname={entry.nickname} avatarUrl={entry.avatarUrl} size={36} />
      <span className="min-w-0 flex-1 truncate text-body-md font-medium text-on-surface">{entry.nickname}{entry.isMe && <span className="ml-2 rounded-full bg-secondary px-2 py-0.5 text-label-sm text-on-secondary">Bạn</span>}</span>
      <span className="shrink-0 font-serif text-headline-md text-primary">{fmt(entry.points)}<span className="sr-only"> điểm</span></span>
    </li>
  );
}
