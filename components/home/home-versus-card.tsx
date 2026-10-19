import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Thẻ rủ bạn thi đấu 1v1 (mã phòng hoặc link mời; ghép ngẫu nhiên chưa có nên không hứa tìm đối thủ lạ). */
export function HomeVersusCard() {
  return (
    <section aria-labelledby="versus-heading" className="card-ink flex items-center gap-space-sm bg-tertiary-container p-space-md text-on-tertiary-container">
      <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-tertiary text-on-tertiary"><Icon name="group" size={26} /></span>
      <div className="min-w-0 flex-1">
        <h2 id="versus-heading" className="text-headline-md">Thi đấu 1v1</h2>
        <p className="text-body-md">Mời một người bạn đấu 10 câu điền lời, ai đúng nhiều hơn thắng.</p>
      </div>
      <Link href="/room" className="btn-3d btn-3d-tertiary shrink-0">Mời bạn</Link>
    </section>
  );
}
