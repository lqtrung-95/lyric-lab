import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TruthOrLieRoom } from "@/components/practice/truth-or-lie-room";
import { ModeTabs } from "@/components/review/mode-tabs";
import { COOP_CODE } from "@/lib/explore/coop/coop-state";
import { loadTruthSet } from "@/lib/practice/load-practice-sets";
import { hashString, seededRng } from "@/lib/practice/seeded-rng";
import { ROOM_ROUNDS } from "@/lib/practice/truth-room";

export const metadata: Metadata = { title: "Hai thật một giả cùng bạn", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Phòng Hai thật một giả cùng bạn: bộ câu suy ra từ mã phòng nên hai người nhận giống hệt nhau. */
export default async function TruthRoomPage({ params }: { params: Promise<{ code: string; role: string }> }) {
  const { code, role } = await params;
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room) || (role !== "a" && role !== "b")) notFound();
  const set = await loadTruthSet(ROOM_ROUNDS, seededRng(hashString(room)));
  return (
    <>
      <ModeTabs />
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Hai thật một giả cùng bạn</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Cùng một bộ câu, ai tìm đúng câu sai nhiều hơn là thắng. Gửi liên kết mời cho bạn bè rồi chơi cùng lúc.</p>
        <div className="mt-space-md"><TruthOrLieRoom key={`${room}/${role}`} code={room} role={role} trials={set.trials} pinyin={set.pinyin} /></div>
      </div>
    </>
  );
}
