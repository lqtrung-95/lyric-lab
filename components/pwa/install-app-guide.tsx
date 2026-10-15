"use client";

import { useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon-names";
import { detectInstallPlatform, isInAppBrowser, isStandaloneDisplay, type InstallPlatform } from "@/lib/pwa/install-platform";
import { AndroidStep1Art, AndroidStep2Art, AndroidStep3Art, IosStep1Art, IosStep2Art, IosStep3Art } from "./install-step-art";
import { useInstallPrompt } from "./install-prompt-store";

type Tab = "ios" | "android";
interface Step { icon: IconName; text: React.ReactNode; art: React.ReactNode }

const IOS_STEPS: Step[] = [
  { icon: "ios_share", text: <>Mở SongHanzi bằng <b>Safari</b>, rồi bấm nút <b>Chia sẻ</b> (hình ô vuông có mũi tên hướng lên) ở thanh dưới cùng của iPhone, hoặc ở góc trên của iPad.</>, art: <IosStep1Art /> },
  { icon: "add_box", text: <>Kéo danh sách xuống và chọn <b>Thêm vào Màn hình chính</b> (Add to Home Screen).</>, art: <IosStep2Art /> },
  { icon: "check_circle", text: <>Bấm <b>Thêm</b> ở góc trên bên phải. Biểu tượng SongHanzi hiện ra ở màn hình chính, bấm vào là mở như một app.</>, art: <IosStep3Art /> },
];
const ANDROID_STEPS: Step[] = [
  { icon: "more_vert", text: <>Mở SongHanzi bằng <b>Chrome</b>, bấm nút menu <b>⋮</b> (ba chấm dọc) ở góc trên bên phải.</>, art: <AndroidStep1Art /> },
  { icon: "install_mobile", text: <>Chọn <b>Cài đặt ứng dụng</b> (hoặc <b>Thêm vào màn hình chính</b>).</>, art: <AndroidStep2Art /> },
  { icon: "check_circle", text: <>Bấm <b>Cài đặt</b> để xác nhận. Biểu tượng SongHanzi hiện ở màn hình chính và trong danh sách ứng dụng.</>, art: <AndroidStep3Art /> },
];

const noop = () => () => undefined;
/** Chuỗi trình duyệt chỉ có ở client; phía server trả rỗng để không lệch khi hydrate. */
const useUserAgent = () => useSyncExternalStore(noop, () => navigator.userAgent, () => "");
const usePlatform = (): InstallPlatform => useSyncExternalStore(noop, () => detectInstallPlatform(navigator.userAgent, navigator.platform, navigator.maxTouchPoints), () => "other");
const useStandalone = () => useSyncExternalStore(noop, isStandaloneDisplay, () => false);

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-space-sm">
      {steps.map((s, i) => (
        <li key={i} className="space-y-space-sm rounded-2xl bg-surface-container-low p-space-sm">
          <div className="flex gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container"><Icon name={s.icon} size={22} /></span>
            <p className="min-w-0 self-center text-body-md text-on-surface"><span className="mr-1 font-semibold text-primary">Bước {i + 1}.</span>{s.text}</p>
          </div>
          <div className="flex justify-center">{s.art}</div>
        </li>
      ))}
    </ol>
  );
}

/**
 * Hướng dẫn cài SongHanzi lên màn hình chính điện thoại (PWA): tab iPhone/iPad và Android (tự chọn theo thiết bị, đổi tay được vì người đọc có thể đang ở máy tính),
 * nút "Cài app ngay" một chạm khi Chrome cho phép, báo riêng khi đang mở trong Zalo/Facebook (không cài được ở đó) và khi đã cài rồi.
 */
export function InstallAppGuide() {
  const detected = usePlatform();
  const userAgent = useUserAgent();
  const standalone = useStandalone();
  const { canInstall, install } = useInstallPrompt();
  const [picked, setPicked] = useState<Tab | null>(null);
  const [result, setResult] = useState<"accepted" | "dismissed" | null>(null);
  const tab: Tab = picked ?? (detected === "android" ? "android" : "ios");

  if (standalone) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-2xl bg-secondary-container p-space-md text-on-secondary-container">
        <Icon name="check_circle" filled size={24} />
        <p className="text-body-md"><b>Bạn đang dùng SongHanzi như một app rồi.</b> Lần sau cứ mở từ biểu tượng ở màn hình chính nhé.</p>
      </div>
    );
  }

  const chip = "inline-flex min-h-11 items-center rounded-full px-5 text-label-md font-semibold transition-colors";
  return (
    <div className="space-y-space-md">
      {userAgent && isInAppBrowser(userAgent) && (
        <p role="note" className="rounded-2xl bg-tertiary-container p-space-sm text-body-md text-on-tertiary-container">
          Bạn đang mở SongHanzi trong một ứng dụng khác (Zalo, Facebook...). Ở đây không cài được: hãy bấm menu <b>⋯</b> của ứng dụng đó, chọn <b>Mở bằng trình duyệt</b> (Safari hoặc Chrome), rồi làm theo các bước dưới đây.
        </p>
      )}

      <div role="group" aria-label="Chọn loại điện thoại" className="flex gap-2">
        <button type="button" aria-pressed={tab === "ios"} onClick={() => setPicked("ios")} className={`${chip} ${tab === "ios" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}>iPhone / iPad</button>
        <button type="button" aria-pressed={tab === "android"} onClick={() => setPicked("android")} className={`${chip} ${tab === "android" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface"}`}>Android</button>
      </div>

      {tab === "android" && canInstall && (
        <div className="space-y-2 rounded-2xl bg-primary-container/40 p-space-md">
          <p className="text-body-md text-on-surface">Trình duyệt của bạn cho cài ngay bằng một chạm:</p>
          <button type="button" onClick={() => void install().then((ok) => setResult(ok ? "accepted" : "dismissed"))}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary hover:bg-primary-container hover:text-on-primary-container">
            <Icon name="install_mobile" size={20} />Cài app ngay
          </button>
        </div>
      )}
      {/* Thông báo nằm NGOÀI khung nút: sau khi dùng xong sự kiện cài, nút (và khung của nó) biến mất nhưng lời nhắn vẫn phải còn. */}
      {result === "dismissed" && <p role="status" className="rounded-2xl bg-surface-container-low p-space-sm text-body-md text-on-surface-variant">Bạn chưa cài. Muốn cài lúc nào cũng được, làm theo các bước bên dưới nhé.</p>}
      {result === "accepted" && <p role="status" className="rounded-2xl bg-secondary-container p-space-sm text-body-md text-on-secondary-container">Đã cài xong! Tìm biểu tượng SongHanzi ở màn hình chính.</p>}

      <StepList steps={tab === "ios" ? IOS_STEPS : ANDROID_STEPS} />

      <section aria-label="Lợi ích khi cài app" className="rounded-2xl bg-surface-container-low p-space-md">
        <h2 className="font-serif text-headline-md">Cài rồi được gì?</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-body-md text-on-surface-variant">
          <li>Mở nhanh bằng một chạm từ màn hình chính, toàn màn hình, không thanh địa chỉ của trình duyệt.</li>
          {tab === "ios"
            ? <li>iPhone chỉ nhận <b>thông báo nhắc học</b> khi SongHanzi đã được thêm vào Màn hình chính (cần iOS 16.4 trở lên).</li>
            : <li>Ở app YouTube bấm <b>Chia sẻ → SongHanzi</b> là mở thẳng bài hát hoặc video đó, khỏi dán link (iPhone chưa có tính năng này).</li>}
          <li>Dữ liệu học (thẻ ôn, tiến độ) giữ nguyên như khi dùng trên trình duyệt.</li>
        </ul>
        {tab === "android" && <p className="mt-2 text-label-md text-on-surface-variant">Dùng Samsung Internet: bấm menu ≡ → <b>Thêm trang vào</b> → <b>Màn hình chính</b>.</p>}
      </section>
    </div>
  );
}
