import Link from "next/link";
import { GamePet } from "@/components/games/game-pet";
import { Button3d } from "@/components/ui/button-3d";
import type { DuelOutcome, DuelRecord } from "@/lib/pet/pet-duel";

const HEADLINE: Record<DuelOutcome, (name: string) => string> = {
  win: (n) => `Bạn thắng! ${n} chịu thua rồi.`,
  lose: (n) => `${n} thắng! Đấu lại để gỡ nhé.`,
  draw: (n) => `Hòa với ${n}! Ngang tài ngang sức.`,
};

/** Màn kết quả "Đấu với pet": pet ăn mừng khi thắng, rũ xuống khi thua; kèm thành tích cộng dồn trên thiết bị này. */
export function PetDuelResult({ name, outcome, user, pet, record, onAgain }: { name: string; outcome: DuelOutcome; user: number; pet: number; record: DuelRecord; onAgain: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl bg-surface-container-low p-space-md text-center">
      <div className="flex justify-center"><GamePet className="size-28" mood={outcome === "win" ? "hungry" : "happy"} event={{ key: 1, kind: outcome === "win" ? "miss" : "combo" }} /></div>
      <h2 role="status" className="mt-2 text-headline-md">{HEADLINE[outcome](name)}</h2>
      <p className="mt-1 text-label-lg font-extrabold">Bạn {user} – {pet} {name}</p>
      <p className="mt-1 text-label-md text-on-surface-variant">Thành tích với {name}: thắng {record.win} · thua {record.lose} · hòa {record.draw}</p>
      <div className="mt-space-sm flex flex-wrap justify-center gap-2">
        <Button3d type="button" variant="bright" onClick={onAgain}>Đấu lại</Button3d>
        <Link href="/review" className="inline-flex min-h-11 items-center rounded-full px-4 text-label-md font-bold text-on-surface-variant underline">Về Ôn &amp; Nói</Link>
      </div>
    </div>
  );
}
