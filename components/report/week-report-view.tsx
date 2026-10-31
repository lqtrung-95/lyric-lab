"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { ensureAnonymousSession } from "@/lib/auth/ensure-anonymous-session";
import { deltaText, shareSummary, type WeekReport } from "@/lib/report/week-report";

type State = { phase: "loading" } | { phase: "error" } | { phase: "ready"; report: WeekReport };

const WEEKDAY = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const dayLabel = (day: string) => WEEKDAY[new Date(`${day}T00:00:00Z`).getUTCDay()];
const fmtDay = (day: string) => `${day.slice(8, 10)}/${day.slice(5, 7)}`;

function Stat({ label, value, cur, prev }: { label: string; value: string; cur: number; prev: number }) {
  const d = deltaText(cur, prev);
  return (
    <div className="rounded-2xl bg-surface-container-lowest p-space-sm">
      <dt className="text-label-md text-on-surface-variant">{label}</dt>
      <dd className="text-headline-md font-extrabold">{value}</dd>
      {d && <p className={`text-label-sm font-bold ${cur > prev ? "text-secondary" : cur < prev ? "text-error" : "text-on-surface-variant"}`}>{d}</p>}
    </div>
  );
}

/** Báo cáo tuần: số ngày học, thẻ đã ôn, lượt luyện, độ chính xác, biểu đồ 7 ngày và so với tuần trước, kèm nút chia sẻ câu tóm tắt. */
export function WeekReportView() {
  const [state, setState] = useState<State>({ phase: "loading" });

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        if (!(await ensureAnonymousSession())) throw new Error("no session");
        const res = await fetch("/api/report/week", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const report = (await res.json()) as WeekReport;
        if (live) setState({ phase: "ready", report });
      } catch { if (live) setState({ phase: "error" }); }
    })();
    return () => { live = false; };
  }, []);

  if (state.phase === "loading") return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tính báo cáo tuần…</p>;
  if (state.phase === "error") return <p role="alert" className="py-space-lg text-body-md text-error">Chưa tải được báo cáo. Kiểm tra kết nối rồi tải lại trang nhé.</p>;
  return <WeekReportBody report={state.report} />;
}

/** Phần hiển thị của báo cáo (tách khỏi việc tải dữ liệu để dễ xem thử và test). */
export function WeekReportBody({ report: r }: { report: WeekReport }) {
  const [copied, setCopied] = useState(false);
  const c = r.current, p = r.previous;
  const max = Math.max(1, ...r.bars.map((b) => b.items));
  const empty = c.studyDays === 0;
  const summary = shareSummary(r);
  const share = async () => {
    try {
      if (navigator.share) { await navigator.share({ text: summary }); return; }
      await navigator.clipboard.writeText(summary);
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    } catch { /* người dùng hủy chia sẻ */ }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">Báo cáo tuần</h1>
        <p className="text-body-md text-on-surface-variant">7 ngày gần nhất, từ {fmtDay(r.from)} đến {fmtDay(r.to)}, so với 7 ngày trước đó.</p>
      </header>

      {empty ? (
        <section className="card-ink p-space-lg text-center"><p className="text-body-lg">Tuần này bạn chưa học ngày nào. Chỉ cần ôn vài thẻ là có số liệu ở đây.</p><Link href="/review" className="btn-3d btn-3d-primary mt-space-md inline-flex min-h-12 items-center px-6 font-extrabold">Ôn thẻ ngay</Link></section>
      ) : (
        <>
          <section aria-label="Số liệu" className="card-ink p-space-md">
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Stat label="Ngày học" value={`${c.studyDays}/7`} cur={c.studyDays} prev={p.studyDays} />
              <Stat label="Thẻ đã ôn" value={String(c.cardsReviewed)} cur={c.cardsReviewed} prev={p.cardsReviewed} />
              <Stat label="Lượt luyện" value={String(c.practiceRounds)} cur={c.practiceRounds} prev={p.practiceRounds} />
              <Stat label="Câu đã trả lời" value={String(c.answered)} cur={c.answered} prev={p.answered} />
              <Stat label="Độ chính xác" value={r.accuracyPct === null ? "—" : `${r.accuracyPct}%`} cur={r.accuracyPct ?? 0} prev={p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : 0} />
              <Stat label="Thẻ mới lưu" value={String(r.newCards)} cur={r.newCards} prev={0} />
            </dl>
          </section>

          <section aria-labelledby="wr-days" className="card-ink p-space-md">
            <h2 id="wr-days" className="text-headline-sm font-extrabold">Từng ngày</h2>
            <ol className="mt-space-sm grid grid-cols-7 gap-1.5" aria-label="Số mục học mỗi ngày">
              {r.bars.map((b) => (
                <li key={b.day} className="flex flex-col items-center gap-1">
                  <span className="text-label-sm font-bold">{b.items}</span>
                  <span className="flex h-24 w-full items-end rounded-xl bg-surface-container"><span aria-hidden="true" className={`block w-full rounded-xl ${b.studied ? "bg-primary" : "bg-surface-container-high"}`} style={{ height: `${Math.max(b.items > 0 ? 8 : 0, (b.items / max) * 100)}%` }} /></span>
                  <span className="text-label-sm text-on-surface-variant">{dayLabel(b.day)}</span>
                </li>
              ))}
            </ol>
            {r.bestDay && <p className="mt-space-sm text-body-md">Ngày chăm nhất: <b>{dayLabel(r.bestDay.day)} {fmtDay(r.bestDay.day)}</b> với {r.bestDay.items} mục.</p>}
          </section>

          {r.topModes.length > 0 && (
            <section aria-labelledby="wr-modes" className="card-ink p-space-md">
              <h2 id="wr-modes" className="text-headline-sm font-extrabold">Bạn hay luyện</h2>
              <ul className="mt-space-sm flex flex-wrap gap-2">{r.topModes.map((m) => <li key={m.mode} className="rounded-full border-2 border-ink bg-surface-container px-4 py-1 text-label-md font-bold">{m.label} · {m.rounds} lượt</li>)}</ul>
            </section>
          )}
        </>
      )}

      <section className="card-ink flex flex-wrap items-center justify-between gap-space-sm p-space-md">
        <p className="text-body-md">Đã học {r.totalLearned} từ tất cả. {empty ? "" : "Làm tiếp để tuần sau còn đẹp hơn."}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/review/weak" className="btn-3d btn-3d-neutral inline-flex min-h-11 items-center gap-1 px-4 text-label-md font-extrabold"><Icon name="local_fire_department" size={18} /> Điểm yếu</Link>
          {!empty && <button type="button" onClick={() => void share()} className="btn-3d btn-3d-primary inline-flex min-h-11 items-center gap-1 px-4 text-label-md font-extrabold"><Icon name="share" size={18} /> {copied ? "Đã chép câu tóm tắt" : "Chia sẻ"}</button>}
        </div>
      </section>
    </div>
  );
}
