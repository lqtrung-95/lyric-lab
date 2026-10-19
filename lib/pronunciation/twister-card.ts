// Thẻ chia sẻ kết quả thử thách 绕口令: vẽ PNG ngay trên trình duyệt (đúng font của trang). Chỉ chứa câu dân gian và điểm, không có dữ liệu cá nhân.
import { SITE_URL } from "@/lib/seo/site-url";

const W = 1080, H = 1350;
const PRIMARY = "#a35000", SECONDARY = "#3b6931", INK = "#2c1d11", MUTED = "#564337";

/** Ngắt chữ Hán thành các dòng không quá `perLine` ký tự. */
export function wrapChars(text: string, perLine: number): string[] {
  const chars = [...text];
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += perLine) lines.push(chars.slice(i, i + perLine).join(""));
  return lines;
}

export async function renderTwisterCard(d: { han: string; score: number; title: string }): Promise<Blob> {
  await document.fonts.ready;
  await document.fonts.load('700 64px "Noto Sans SC"', d.han).catch(() => undefined);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const c = canvas.getContext("2d")!;
  const sans = "'Plus Jakarta Sans', system-ui, sans-serif";
  const serif = "'Plus Jakarta Sans', system-ui, sans-serif";
  c.beginPath(); c.roundRect(0, 0, W, H, 48); c.clip();
  c.fillStyle = "#fef9ed"; c.fillRect(0, 0, W, H);
  const bar = c.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, PRIMARY); bar.addColorStop(1, SECONDARY);
  c.fillStyle = bar; c.fillRect(0, 0, W, 14);

  c.fillStyle = INK; c.font = `600 44px ${serif}`; c.fillText("SongHanzi", 90, 150);
  c.fillStyle = MUTED; c.font = `400 42px ${sans}`; c.fillText(d.title, 90, 230);

  c.fillStyle = PRIMARY; c.font = `700 300px ${serif}`; c.fillText(String(d.score), 90, 560);
  c.fillStyle = INK; c.font = `600 64px ${sans}`; c.fillText("điểm phát âm", 90, 650);

  c.fillStyle = INK; c.font = `700 64px "Noto Sans SC", serif`;
  wrapChars(d.han, 12).slice(0, 4).forEach((line, i) => c.fillText(line, 90, 800 + i * 96));

  c.fillStyle = MUTED; c.font = `400 34px ${sans}`;
  c.fillText(`Bạn đọc được bao nhiêu điểm? ${SITE_URL.replace(/^https?:\/\//, "")}/phat-am`, 90, 1250);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}

/** Chia sẻ ảnh bằng share sheet nếu trình duyệt cho gửi tệp, không thì tải ảnh về. Trả "shared" | "cancelled" | "downloaded". */
export async function shareOrDownload(blob: Blob, filename: string, text: string): Promise<"shared" | "cancelled" | "downloaded"> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.canShare?.({ files: [file] })) {
    try { await navigator.share({ files: [file], text, url: `${SITE_URL}/phat-am` }); return "shared"; }
    catch (e) { if ((e as Error).name === "AbortError") return "cancelled"; }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return "downloaded";
}
