import { wrapText } from "./wrap-text";

const W = 1080;
const H = 1350;
const PRIMARY = "#b03a2e";
const SECONDARY = "#2e6b5e";
const INK = "#1c1611";
const MUTED = "#5c5147";
const MAX_LINES = 4;

export interface LineCardData {
  han: string;
  pinyin?: string;
  translation?: string;
  title: string;
  artist?: string;
  /** Tên miền hiển thị cuối thẻ (không có giao thức). */
  site: string;
}

/**
 * Vẽ thẻ chia sẻ MỘT câu lời (PNG) ngay trên trình duyệt, cùng phong cách thẻ chuỗi ngày học. Chỉ một dòng lời kèm nghĩa tiếng Việt,
 * không tạo trang công khai chứa lời (quy tắc bản quyền của dự án). Dòng quá dài bị cắt bớt ở cuối.
 */
export async function renderLineCard(d: LineCardData): Promise<Blob> {
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const sans = "'Be Vietnam Pro', system-ui, sans-serif";
  const serif = "Lora, Georgia, serif";
  const hanFont = `600 96px "Noto Serif SC", ${serif}`;
  const left = 90;
  const maxWidth = W - left * 2;
  const measureWith = (font: string) => (s: string) => { c.font = font; return c.measureText(s).width; };

  c.beginPath();
  c.roundRect(0, 0, W, H, 48);
  c.clip();
  c.fillStyle = "#fff8f4";
  c.fillRect(0, 0, W, H);
  const glow = c.createRadialGradient(W, 0, 0, W, 0, 900);
  glow.addColorStop(0, "rgba(176, 58, 46, 0.2)");
  glow.addColorStop(1, "rgba(176, 58, 46, 0)");
  c.fillStyle = glow;
  c.fillRect(0, 0, W, H);
  const bar = c.createLinearGradient(0, 0, W, 0);
  bar.addColorStop(0, PRIMARY);
  bar.addColorStop(1, SECONDARY);
  c.fillStyle = bar;
  c.fillRect(0, 0, W, 14);

  c.textAlign = "left";
  c.fillStyle = INK;
  c.font = `600 44px ${serif}`;
  c.fillText("SongHanzi", left, 150);

  const limit = (lines: string[]) => (lines.length > MAX_LINES ? [...lines.slice(0, MAX_LINES - 1), `${lines[MAX_LINES - 1]}…`] : lines);
  let y = 330;
  c.fillStyle = INK;
  c.font = hanFont;
  const hanLines = limit(wrapText(d.han, measureWith(hanFont), maxWidth, "char"));
  for (const line of hanLines) { c.fillText(line, left, y); y += 140; }

  if (d.pinyin) {
    y += 10;
    const font = `400 40px ${sans}`;
    c.fillStyle = PRIMARY;
    c.font = font;
    for (const line of limit(wrapText(d.pinyin, measureWith(font), maxWidth, "word"))) { c.fillText(line, left, y); y += 58; }
  }
  if (d.translation) {
    y += 40;
    const font = `italic 400 46px ${sans}`;
    c.fillStyle = MUTED;
    c.font = font;
    for (const line of limit(wrapText(`“${d.translation}”`, measureWith(font), maxWidth, "word"))) { c.fillText(line, left, y); y += 66; }
  }

  c.strokeStyle = "rgba(28, 22, 17, 0.12)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(left, 1130);
  c.lineTo(W - left, 1130);
  c.stroke();
  c.fillStyle = INK;
  c.font = `600 40px ${sans}`;
  c.fillText(d.artist ? `${d.title} · ${d.artist}` : d.title, left, 1195, maxWidth);
  c.fillStyle = MUTED;
  c.font = `400 34px ${sans}`;
  c.fillText(`Học tiếng Trung qua bài hát · ${d.site}`, left, 1255, maxWidth);

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}
