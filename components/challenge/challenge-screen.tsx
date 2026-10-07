"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { NicknameGate } from "@/components/profile/nickname-gate";
import { useNickname } from "@/components/profile/use-nickname";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import type { AnsweredQuestion, ChallengeInfo } from "@/lib/challenges/challenge-types";
import type { RoomQuestionPublic } from "@/lib/rooms/room-question-types";
import { ChallengePlay } from "./challenge-play";
import { ChallengeStandings } from "./challenge-standings";
import { ShareChallengeButton } from "./share-challenge-button";

type Load = { status: "loading" } | { status: "missing" } | { status: "ready"; info: ChallengeInfo };
type Session = { attemptId: string; questions: RoomQuestionPublic[]; answered: AnsweredQuestion[] };

const START_ERRORS: Record<string, string> = {
  expired: "Thử thách này đã hết hạn.",
  already_finished: "Bạn đã chơi xong thử thách này.",
  not_found: "Không tìm thấy thử thách.",
};

/** Màn thử thách không cần cùng lúc: xem người thách và bảng điểm, chơi bộ 10 câu cố định, rồi so điểm và chia sẻ link. */
export function ChallengeScreen({ code }: { code: string }) {
  const nick = useNickname();
  const [load, setLoad] = useState<Load>({ status: "loading" });
  const [session, setSession] = useState<Session | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    let cancelled = false;
    ensureAnonymousSession()
      .then(() => fetch(`/api/challenges/${code}`, { cache: "no-store" }))
      .then((res) => (res.ok ? (res.json() as Promise<ChallengeInfo>) : null))
      .then((info) => { if (!cancelled) setLoad(info ? { status: "ready", info } : { status: "missing" }); })
      .catch(() => { if (!cancelled) setLoad({ status: "missing" }); });
    return () => { cancelled = true; };
  }, [code, reloadKey]);

  async function start() {
    setStarting(true);
    setError(null);
    const res = await fetch(`/api/challenges/${code}/start`, { method: "POST" }).catch(() => null);
    setStarting(false);
    if (!res?.ok) {
      const body = res ? ((await res.json().catch(() => null)) as { error?: string } | null) : null;
      return setError(START_ERRORS[body?.error ?? ""] ?? "Chưa bắt đầu được. Thử lại sau nhé.");
    }
    setSession((await res.json()) as Session);
  }

  if (load.status === "loading") return <div className="mx-auto max-w-2xl space-y-space-md"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-40 w-full" /></div>;
  if (load.status === "missing") {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl bg-surface-container-low p-space-lg text-center">
        <p className="font-serif text-headline-md">Không tìm thấy thử thách</p>
        <p className="mt-1 text-body-md text-on-surface-variant">Link có thể sai hoặc thử thách đã bị xóa.</p>
        <Link href="/room" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Về sảnh thi đấu</Link>
      </div>
    );
  }

  const { info } = load;
  if (session) {
    return (
      <ChallengePlay
        code={code} attemptId={session.attemptId} questions={session.questions} initialAnswered={session.answered} songTitle={info.songTitle}
        onFinished={() => { setSession(null); refresh(); }}
      />
    );
  }

  const finished = info.mine?.finished === true;
  const best = info.standings[0];
  return (
    <div className="mx-auto max-w-2xl space-y-space-lg">
      <section className="relative isolate overflow-hidden rounded-3xl bg-surface-container-low px-space-md py-space-xl md:px-space-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_95%_0%,color-mix(in_srgb,var(--primary-container)_18%,transparent),transparent)]" />
        <p className="text-label-md font-semibold tracking-wide text-primary">THỬ THÁCH · 挑战</p>
        <h1 className="mt-1 font-serif text-headline-lg-mobile md:text-headline-lg">
          {finished ? `Bạn được ${info.mine!.points} điểm` : `${info.creatorName} thách bạn!`}
        </h1>
        <p className="mt-space-sm text-body-lg text-on-surface-variant">
          {info.questionCount} câu điền lời bài <strong lang="zh" className="text-on-surface">{info.songTitle ?? "này"}</strong>, mỗi câu 15 giây.
          {best && !finished && <> Điểm cao nhất hiện tại: <strong className="text-on-surface">{best.points}</strong>.</>}
        </p>

        {finished ? (
          <div className="mt-space-md"><ShareChallengeButton code={code} points={info.mine!.points} /></div>
        ) : info.expired && !info.mine ? (
          <p role="status" className="mt-space-md text-body-md text-on-surface-variant">Thử thách này đã hết hạn.</p>
        ) : (
          <div className="mt-space-md space-y-space-sm">
            <NicknameGate state={nick}>
              {() => (
                <button type="button" onClick={() => void start()} disabled={starting} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-label-md font-semibold text-on-primary hover:bg-primary-container disabled:opacity-60">
                  <Icon name="play_arrow" filled size={20} />{info.mine ? `Tiếp tục (đã trả lời ${info.mine.answered}/${info.questionCount})` : "Bắt đầu chơi"}
                </button>
              )}
            </NicknameGate>
            {error && <p role="alert" className="text-label-md text-error">{error}</p>}
          </div>
        )}
      </section>

      <section aria-labelledby="standings-heading" className="space-y-space-sm">
        <h2 id="standings-heading" className="font-serif text-headline-md text-on-surface">Bảng điểm</h2>
        <ChallengeStandings code={code} standings={info.standings} />
      </section>
      <p className="text-center text-label-md text-on-surface-variant"><Link href="/room" className="font-medium text-primary hover:underline">Về sảnh thi đấu</Link></p>
    </div>
  );
}
