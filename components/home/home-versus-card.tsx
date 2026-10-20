import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Dải rủ bạn thi đấu 1v1 (mã phòng hoặc link mời; ghép ngẫu nhiên chưa có nên không hứa tìm đối thủ lạ). Mỏng và trung tính để không lấn hai hàng việc chính. */
export function HomeVersusCard() {
  return (
    <section aria-labelledby="versus-heading" className="card-ink flex flex-wrap items-center gap-x-space-md gap-y-space-sm px-space-md py-space-sm">
      <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl border-2 border-ink bg-tertiary-container text-on-tertiary-container"><Icon name="group" size={24} /></span>
      <div className="min-w-0 flex-1 basis-56">
        <h2 id="versus-heading" className="text-headline-md">Thi đấu 1v1</h2>
        <p className="text-body-md text-on-surface-variant">Mời một người bạn đấu 10 câu điền lời, ai đúng nhiều hơn thắng.</p>
      </div>
      <Link href="/room" className="btn-3d btn-3d-tertiary shrink-0">Mời bạn</Link>
    </section>
  );
}
