import { notFound } from "next/navigation";
import { Button3d } from "@/components/ui/button-3d";
import { Icon } from "@/components/ui/icon";

// Trang xem bộ thành phần của thiết kế mới (token màu, chữ, nút 3D, thẻ viền mực). Chỉ có ở môi trường phát triển và test; dùng để duyệt sáng/tối và chạy kiểm tra truy cập.
export const metadata = { robots: { index: false, follow: false } };

const SWATCHES = ["primary", "primary-container", "secondary", "secondary-container", "tertiary", "tertiary-container", "error", "surface-container-high"] as const;

export default function UiKitPage() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_DEV_FIXTURES !== "1") notFound(); // ENABLE_DEV_FIXTURES=1 chỉ đặt khi chạy e2e trên bản production
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl space-y-space-lg p-space-md outline-none">
      <header>
        <h1 className="text-headline-xl-mobile md:text-headline-xl">Bộ thành phần SongHanzi</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Chữ Hán luôn là phần dễ đọc nhất: <span lang="zh-Hans" className="text-hanzi-display">离开 · 夜车</span></p>
      </header>

      <section aria-labelledby="buttons" className="space-y-space-sm">
        <h2 id="buttons" className="text-headline-md">Nút 3D</h2>
        <div className="flex flex-wrap items-center gap-3 pb-2">
          <Button3d>Vào học ngay</Button3d>
          <Button3d variant="bright">+10 XP · Nhận</Button3d>
          <Button3d variant="secondary"><Icon name="check" size={20} /> Đã thuộc</Button3d>
          <Button3d variant="tertiary"><Icon name="volume_up" size={20} /> Nghe</Button3d>
          <Button3d variant="neutral">Để sau</Button3d>
          <Button3d disabled>Chưa mở</Button3d>
        </div>
      </section>

      <section aria-labelledby="cards" className="space-y-space-sm">
        <h2 id="cards" className="text-headline-md">Thẻ viền mực</h2>
        <div className="card-ink p-space-md">
          <p lang="zh-Hans" className="text-hanzi-display">离开</p>
          <p className="text-pinyin-reading text-primary">lí kāi · Hán Việt: ly khai</p>
          <p className="mt-1 text-body-lg">rời đi, rời khỏi</p>
        </div>
      </section>

      <section aria-labelledby="colors" className="space-y-space-sm">
        <h2 id="colors" className="text-headline-md">Màu</h2>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SWATCHES.map((name) => (
            <li key={name} className="rounded-xl p-space-sm text-label-md" style={{ background: `var(--${name})`, color: `var(--on-${name.startsWith("surface") ? "surface" : name})` }}>{name}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="type" className="space-y-space-xs">
        <h2 id="type" className="text-headline-md">Chữ</h2>
        <p className="text-headline-xl-mobile">Tiêu đề đậm, tròn, đủ dấu: Ẩn dụ, ướt át, thương yêu</p>
        <p className="text-body-lg">Nội dung đọc thoải mái ở cỡ 17px: tớ đang học tiếng Trung qua bài hát.</p>
        <p className="text-label-md text-on-surface-variant">Nhãn và chú thích 13px đậm vừa</p>
      </section>
    </main>
  );
}
