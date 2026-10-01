import { SITE_URL } from "@/lib/seo/site-url";
import type { StreakData } from "./load-streak";

const W = 1080;
const H = 1350;
const PRIMARY = "#b03a2e";
const SECONDARY = "#2e6b5e";
const INK = "#1c1611";
const MUTED = "#5c5147";

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
}

/**
 * Vẽ thẻ chia sẻ (PNG) ngay trên trình duyệt để dùng đúng font của trang (có đủ dấu tiếng Việt).
 * Chỉ chứa số liệu học của người dùng, không có lời bài hát.
 */
export async function renderShareCard(d: Pick<StreakData, "current" | "learnedWords" | "weekCount">): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const sans = "'Be Vietnam Pro', system-ui, sans-serif";
  const serif = "Lora, Georgia, serif";

  // Khung bo góc cho cả thẻ, bên ngoài khung giữ trong suốt (đẹp hơn khi xem trước trong popup/khi tải về).
  const radius = 48;
  roundRect(c, 0, 0, W, H, radius);
  c.clip();

  c.fillStyle = "#fff8f4";
  c.fillRect(0, 0, W, H);
  const glowTop = c.createRadialGradient(W, 0, 0, W, 0, 900);
  glowTop.addColorStop(0, "rgba(176, 58, 46, 0.2)");
  glowTop.addColorStop(1, "rgba(176, 58, 46, 0)");
  c.fillStyle = glowTop;
  c.fillRect(0, 0, W, H);
  const glowBottom = c.createRadialGradient(0, H, 0, 0, H, 700);
  glowBottom.addColorStop(0, "rgba(46, 107, 94, 0.12)");
  glowBottom.addColorStop(1, "rgba(46, 107, 94, 0)");
  c.fillStyle = glowBottom;
  c.fillRect(0, 0, W, H);

  // Dải màu thương hiệu trên cùng, mỏng — tạo điểm nhấn thay vì nền phẳng toàn bộ.
  const topBar = c.createLinearGradient(0, 0, W, 0);
  topBar.addColorStop(0, PRIMARY);
  topBar.addColorStop(1, SECONDARY);
  c.fillStyle = topBar;
  c.fillRect(0, 0, W, 14);

  c.fillStyle = "rgba(176, 58, 46, 0.06)";
  c.font = `700 760px "Noto Serif SC", serif`;
  c.textAlign = "right";
  c.fillText("歌", W + 40, H - 120);

  c.textAlign = "left";
  c.fillStyle = PRIMARY;
  c.beginPath();
  c.arc(104, 128, 10, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = INK;
  c.font = `600 44px ${serif}`;
  c.fillText("SongHanzi", 130, 142);

  c.fillStyle = MUTED;
  c.font = `400 42px ${sans}`;
  c.fillText("Chuỗi ngày học tiếng Trung qua bài hát", 90, 420);

  c.fillStyle = PRIMARY;
  c.font = `700 300px ${serif}`;
  c.fillText(String(d.current), 90, 700);
  c.fillStyle = INK;
  c.font = `600 64px ${sans}`;
  c.fillText("ngày liên tiếp", 90, 790);

  const stats: [string, number][] = [["từ đã ôn", d.learnedWords], ["ngày học tuần này", d.weekCount]];
  stats.forEach(([label, value], i) => {
    const x = 90 + i * 460;
    roundRect(c, x - 32, 900, 400, 200, 28);
    c.fillStyle = "rgba(28, 22, 17, 0.04)";
    c.fill();
    c.fillStyle = PRIMARY;
    c.font = `700 96px ${serif}`;
    c.fillText(String(value), x, 1010);
    c.fillStyle = MUTED;
    c.font = `400 36px ${sans}`;
    c.fillText(label, x, 1070);
  });

  c.strokeStyle = "rgba(28, 22, 17, 0.12)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(90, 1190);
  c.lineTo(W - 90, 1190);
  c.stroke();

  c.fillStyle = MUTED;
  c.font = `400 34px ${sans}`;
  c.fillText(SITE_URL.replace(/^https?:\/\//, ""), 90, 1250);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}

// Mobile có share sheet thật của hệ điều hành (liệt kê Facebook/Zalo/Messenger... nếu máy có cài) — tốt hơn hẳn
// 3 nút cố định trong popup tự dựng, nên ưu tiên dùng. Desktop không có share sheet nên mới cần popup riêng.
const MOBILE_UA = /Android|iPhone|iPad|iPod/i;
export const isMobileDevice = (): boolean => MOBILE_UA.test(navigator.userAgent);

/** Chia sẻ link bằng share sheet của hệ điều hành (mobile). Trả "shared" | "cancelled" | "unsupported". */
export async function shareLinkNative(url: string, title: string, text: string): Promise<"shared" | "cancelled" | "unsupported"> {
  if (!navigator.share) return "unsupported";
  try {
    await navigator.share({ title, text, url });
    return "shared";
  } catch (e) {
    if ((e as Error).name === "AbortError") return "cancelled";
    throw e;
  }
}
