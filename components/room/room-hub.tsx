"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { CreateChallengeDialog } from "./create-challenge-dialog";
import { CreateRoomDialog } from "./create-room-dialog";
import { JoinRoomForm } from "./join-room-form";

/** Sảnh Thi đấu 1v1: mời bạn (tạo phòng), nhập mã/link để vào phòng, và quy tắc tính điểm. Ghép ngẫu nhiên sắp có. */
export function RoomHub() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [challenging, setChallenging] = useState(false);
  const card = "rounded-2xl bg-surface-container-lowest p-space-md shadow-sm";

  return (
    <div className="space-y-space-lg">
      <section className="relative isolate overflow-hidden rounded-3xl bg-surface-container-low px-space-md py-space-xl md:px-space-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_70%_at_95%_0%,color-mix(in_srgb,var(--primary-container)_18%,transparent),transparent)]" />
        <p className="text-label-md font-semibold tracking-wide text-primary">THỜI GIAN THỰC · 实时对决</p>
        <h1 className="mt-1 font-serif text-headline-lg-mobile md:text-headline-lg">Luyện tập đối kháng 1v1</h1>
        <p className="mt-space-sm max-w-xl text-body-lg text-on-surface-variant">
          So tài cảm thụ ca từ và phản xạ Hán ngữ cùng bạn bè, trả lời cùng lúc trong thời gian thực.
        </p>
        <Link href="/room/history" className="mt-space-sm inline-flex min-h-11 items-center gap-1 rounded-full bg-surface-container-high px-4 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest">
          <Icon name="history" size={18} /> Lịch sử thi đấu
        </Link>
      </section>

      <div className="grid gap-space-md lg:grid-cols-2">
        <section aria-labelledby="invite-heading" className={`${card} flex flex-col`}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-container text-on-primary-container"><Icon name="person_add" size={22} /></span>
            <div>
              <h2 id="invite-heading" className="font-serif text-headline-md text-on-surface">Mời bạn luyện cùng</h2>
              <p className="text-label-md text-on-surface-variant">Tạo phòng riêng và gửi mã hoặc link cho bạn bè.</p>
            </div>
          </div>
          <ul className="mt-space-md flex-1 space-y-2 text-body-md text-on-surface-variant">
            {["Chọn bài ngẫu nhiên hoặc tự chọn bài bạn thích", "Gửi mã 6 số hoặc link, bạn bè vào là chơi", "10 câu điền từ, hai người trả lời cùng lúc"].map((line) => (
              <li key={line} className="flex items-start gap-2"><Icon name="check_circle" filled size={18} className="mt-0.5 shrink-0 text-secondary" />{line}</li>
            ))}
          </ul>
          <button type="button" onClick={() => setCreating(true)} className="mt-space-md min-h-11 w-full rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">
            Tạo phòng
          </button>
        </section>

        <section aria-labelledby="join-heading" className={card}>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><Icon name="link" size={22} /></span>
            <div>
              <h2 id="join-heading" className="font-serif text-headline-md text-on-surface">Nhập mã phòng bạn bè</h2>
              <p className="text-label-md text-on-surface-variant">Điền mã 6 số hoặc dán link mời để vào ngay.</p>
            </div>
          </div>
          <div className="mt-space-md">
            <JoinRoomForm onJoined={(code) => router.push(`/room/${code}`)} />
          </div>
        </section>

        <section aria-labelledby="challenge-heading" className={`${card} lg:col-span-2`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><Icon name="emoji_events" size={22} /></span>
            <div className="min-w-0 flex-1">
              <h2 id="challenge-heading" className="font-serif text-headline-md text-on-surface">Thử thách không cần cùng lúc</h2>
              <p className="text-label-md text-on-surface-variant">Bạn chơi trước đặt điểm chuẩn, gửi link cho bạn bè. Họ chơi lúc nào cũng được rồi so điểm.</p>
            </div>
            <button type="button" onClick={() => setChallenging(true)} className="min-h-11 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container">Tạo thử thách</button>
          </div>
        </section>

        <section aria-labelledby="random-heading" className={`${card} opacity-80 lg:col-span-2`}>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-high text-on-surface-variant"><Icon name="shuffle" size={22} /></span>
            <div className="min-w-0 flex-1">
              <h2 id="random-heading" className="font-serif text-headline-md text-on-surface">Ghép ngẫu nhiên</h2>
              <p className="text-label-md text-on-surface-variant">Tự động kết nối với bạn học cùng trình độ, không cần hẹn trước.</p>
            </div>
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-sm font-semibold text-on-surface-variant">Sắp có</span>
          </div>
        </section>
      </div>

      <section aria-labelledby="rules-heading" className="rounded-2xl bg-surface-container-low p-space-md">
        <h2 id="rules-heading" className="font-serif text-headline-md text-on-surface">Quy tắc tính điểm</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Mỗi câu đúng được <strong className="text-on-surface">100 điểm</strong>, thêm tối đa 30 điểm thưởng phản xạ nếu trả lời nhanh. Người thắng là người có
          <strong className="text-on-surface"> tổng điểm cao hơn</strong>; bằng điểm thì hòa. Mỗi ván 10 câu điền từ vào chỗ trống, đáp án chỉ hiện sau khi bạn trả lời.
        </p>
      </section>

      <CreateRoomDialog open={creating} onClose={() => setCreating(false)} />
      <CreateChallengeDialog open={challenging} onClose={() => setChallenging(false)} />
    </div>
  );
}
