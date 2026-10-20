import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";

const STEPS: { icon: IconName; title: string; body: string }[] = [
  { icon: "school", title: "Lộ trình HSK 1–6, hơn 700 chặng", body: "Khoảng 5.300 từ chia thành chặng ≤ 10 từ theo chủ đề, có chặng ôn tập và bài kiểm tra cuối cấp. Chưa biết bắt đầu từ đâu? Làm bài xếp lớp 3 phút (HSK 6 vẫn đang phát triển)." },
  { icon: "smart_display", title: "Mỗi chặng học bằng nhiều giác quan", body: "Học từng thẻ và tự đoán nghĩa trước khi lật, xem đúng đoạn video thật có từ đó, đọc to cho máy chấm từng chữ, rồi làm quiz có phản hồi ngay." },
  { icon: "emoji_events", title: "XP, cấp độ và huy hiệu", body: "Ôn thẻ, luyện tập, qua chặng đều tích XP (có trần mỗi ngày để học đều). Huy hiệu bốn bậc đồng, bạc, vàng, kim cương; vài huy hiệu ẩn chờ bạn tự gặp." },
  { icon: "local_fire_department", title: "Nhiệm vụ, chuỗi ngày, thi đấu", body: "Nhiệm vụ nhỏ mỗi ngày và mỗi tuần, lượt đóng băng chuỗi phòng hôm bận, thi đấu 1v1 với bạn bè. Âm thanh hiệu ứng có thể tắt trong Cài đặt." },
];

/** Dải "học như chơi game": giới thiệu lộ trình HSK 1–6, cách học mỗi chặng, XP và huy hiệu, nhiệm vụ (đúng với tính năng đang có trong app). */
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
