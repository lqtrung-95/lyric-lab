import type { StreakData } from "./load-streak";

const W = 1080;
const H = 1350;

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

  c.fillStyle = "#fff8f4";
  c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W, 0, 0, W, 0, 900);
  glow.addColorStop(0, "rgba(176, 58, 46, 0.18)");
  glow.addColorStop(1, "rgba(176, 58, 46, 0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);

  c.fillStyle = "rgba(176, 58, 46, 0.07)";
  c.font = `700 760px "Noto Serif SC", serif`;
  c.textAlign = "right";
  c.fillText("歌", W + 40, H - 120);

  c.textAlign = "left";
  c.fillStyle = "#1c1611";
  c.font = `600 44px ${serif}`;
  c.fillText("SongHanzi", 90, 150);

  c.fillStyle = "#5c5147";
  c.font = `400 42px ${sans}`;
  c.fillText("Chuỗi ngày học tiếng Trung qua bài hát", 90, 420);

  c.fillStyle = "#b03a2e";
  c.font = `700 300px ${serif}`;
  c.fillText(String(d.current), 90, 700);
  c.fillStyle = "#1c1611";
  c.font = `600 64px ${sans}`;
  c.fillText("ngày liên tiếp", 90, 790);

  const stats: [string, number][] = [["từ đã ôn", d.learnedWords], ["ngày học tuần này", d.weekCount]];
  stats.forEach(([label, value], i) => {
    const x = 90 + i * 460;
    c.fillStyle = "#1c1611";
    c.font = `700 96px ${serif}`;
    c.fillText(String(value), x, 1010);
    c.fillStyle = "#5c5147";
    c.font = `400 36px ${sans}`;
    c.fillText(label, x, 1070);
  });

  c.fillStyle = "#5c5147";
  c.font = `400 34px ${sans}`;
  c.fillText("lyric-lab-indol.vercel.app", 90, 1250);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}

/** Chia sẻ ảnh bằng Web Share API (mobile); không hỗ trợ thì tải ảnh về. Trả "shared" | "downloaded" | "cancelled". */
export async function shareOrDownload(blob: Blob): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([blob], "songhanzi-streak.png", { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "SongHanzi" });
      return "shared";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "cancelled";
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  URL.revokeObjectURL(url);
  return "downloaded";
}
