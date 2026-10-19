import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "school", title: "Lộ trình HSK 1: 36 chặng", body: "Từng chặng nhỏ: làm quen từ, nghe câu thật từ video, rồi kiểm tra 10 câu. Chạm chặng nào cũng vào được, không bị khóa." },
  { icon: "star", title: "XP và cấp độ", body: "Ôn thẻ, luyện tập, nghe xong bài đều tích XP. Có trần mỗi ngày để học đều thay vì cày một lần." },
  { icon: "emoji_events", title: "Huy hiệu nhiều bậc", body: "Đồng, bạc, vàng, kim cương cho từ đã học, chuỗi ngày, nghe và nói. Vài huy hiệu ẩn chờ bạn tự gặp." },
  { icon: "local_fire_department", title: "Nhiệm vụ và chuỗi ngày", body: "Nhiệm vụ nhỏ mỗi ngày và mỗi tuần, nhận thưởng khi xong. Có lượt đóng băng chuỗi phòng hôm bận." },
];

/** Dải "học như chơi game": giới thiệu vòng lặp lộ trình, XP, huy hiệu, nhiệm vụ (đúng với tính năng đang có trong app). */
export function GameLoop() {
  return (
    <section aria-labelledby="game-loop-heading" className="mt-24">
      <p className="text-label-md font-semibold uppercase tracking-widest text-secondary">Học như chơi một chuyến phiêu lưu</p>
      <h2 id="game-loop-heading" className="mt-2 max-w-2xl text-headline-lg-mobile md:text-headline-xl">Mỗi ngày một chút, lên cấp thấy rõ</h2>
      <ol className="mt-space-lg grid gap-space-md sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.title} className="card-ink p-space-md">
            <div className="flex items-center justify-between">
              <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-xl border-2 border-ink bg-primary-container text-on-primary-container"><Icon name={s.icon} size={26} filled /></span>
              <span aria-hidden="true" className="text-headline-lg-mobile font-black text-on-surface-variant/40">{i + 1}</span>
            </div>
            <h3 className="mt-space-sm text-headline-md text-on-surface">{s.title}</h3>
            <p className="mt-2 text-body-md text-on-surface-variant">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
