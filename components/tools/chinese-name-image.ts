export interface NameImageInput { vietnamese: string; han: string; pinyin: string | null; lines: string[] }

const W = 1080, H = 1350;

/** Vẽ thẻ "Tên tiếng Trung của tôi" 1080×1350 bằng canvas để lưu/chia sẻ (nền đỏ son kiểu con dấu, chữ Hán thật lớn, nghĩa từng chữ). */
export async function renderNameImage({ vietnamese, han, pinyin, lines }: NameImageInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_canvas");
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const serif = `"Noto Serif SC", "Songti SC", "STSong", serif`;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fff4e0"); bg.addColorStop(1, "#ffd9b0");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#b3261e"; ctx.lineWidth = 14; ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.lineWidth = 3; ctx.strokeRect(78, 78, W - 156, H - 156);
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#6b5b4b"; ctx.font = `600 40px ${sans}`; ctx.fillText("Tên tiếng Trung của", W / 2, 190);
  ctx.fillStyle = "#3a2b2b"; ctx.font = `800 64px ${sans}`; ctx.fillText(vietnamese, W / 2, 275);
  const size = Math.min(300, Math.floor(860 / Math.max(1, [...han].length)));
  ctx.fillStyle = "#b3261e"; ctx.font = `700 ${size}px ${serif}`; ctx.fillText(han, W / 2, 640);
  if (pinyin) { ctx.fillStyle = "#3a2b2b"; ctx.font = `700 70px ${sans}`; ctx.fillText(pinyin, W / 2, 760); }
  ctx.font = `600 38px ${sans}`; ctx.fillStyle = "#5b4636";
  lines.slice(0, 5).forEach((l, i) => ctx.fillText(l, W / 2, 870 + i * 62));
  ctx.fillStyle = "#b3261e"; ctx.font = `800 36px ${sans}`; ctx.fillText("SongHanzi · songhanzi.com/ten-tieng-trung", W / 2, H - 120);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no_blob"))), "image/png"));
}
