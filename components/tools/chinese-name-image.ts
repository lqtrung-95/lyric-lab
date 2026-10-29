export interface NameImageInput { vietnamese: string; han: string; pinyin: string | null; /** Một câu tóm tắt ý nghĩa cả tên (có thể không có). */ summary?: string | null; lines: string[] }

const W = 1080, H = 1350;
const RED = "#b3261e", DARK_RED = "#8f1d17", INK = "#3a2b2b", GOLD = "#c8902e";

/** Xuống dòng theo độ rộng thật của canvas (chữ Việt cách bằng khoảng trắng). */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

/** Họa tiết góc: hai cung và một chấm vàng, đối xứng bốn góc. */
function corner(ctx: CanvasRenderingContext2D, x: number, y: number, sx: number, sy: number) {
  ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
  ctx.strokeStyle = GOLD; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 90); ctx.quadraticCurveTo(0, 0, 90, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 56); ctx.quadraticCurveTo(0, 18, 56, 18); ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(22, 22, 7, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/**
 * Vẽ thẻ "Tên tiếng Trung của tôi" 1080×1350 bằng canvas để lưu/chia sẻ: giấy đỏ son vàng kim kiểu câu đối, họa tiết góc, tên Hán thật lớn trong khung,
 * pinyin, câu tóm tắt ý nghĩa, nghĩa từng chữ và ấn đỏ "名" ở góc.
 */
export async function renderNameImage({ vietnamese, han, pinyin, summary, lines }: NameImageInput): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_canvas");
  const sans = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
  const serif = `"Noto Serif SC", "Songti SC", "STSong", serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";

  // Nền giấy ấm + vầng sáng giữa thẻ
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#fff6e6"); bg.addColorStop(1, "#ffdcb4");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 560, 60, W / 2, 560, 620);
  glow.addColorStop(0, "rgba(255,255,255,0.75)"); glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Khung đôi + họa tiết góc
  ctx.strokeStyle = RED; ctx.lineWidth = 14; ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.lineWidth = 3; ctx.strokeRect(78, 78, W - 156, H - 156);
  corner(ctx, 96, 96, 1, 1); corner(ctx, W - 96, 96, -1, 1); corner(ctx, 96, H - 96, 1, -1); corner(ctx, W - 96, H - 96, -1, -1);

  // Đầu thẻ
  ctx.fillStyle = RED; ctx.font = `800 30px ${sans}`;
  ctx.fillText("T Ê N   T I Ế N G   T R U N G   C Ủ A", W / 2, 168);
  ctx.fillStyle = INK; ctx.font = `800 ${vietnamese.length > 18 ? 56 : 68}px ${sans}`; ctx.fillText(vietnamese, W / 2, 252);

  // Tên Hán trong khung bo góc trắng ngà
  ctx.save(); ctx.shadowColor = "rgba(143,29,23,0.25)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
  ctx.fillStyle = "#fffaf0"; roundRect(ctx, 140, 310, W - 280, 330, 44); ctx.fill(); ctx.restore();
  ctx.strokeStyle = GOLD; ctx.lineWidth = 4; roundRect(ctx, 156, 326, W - 312, 298, 32); ctx.stroke();
  const size = Math.min(260, Math.floor(700 / Math.max(1, [...han].length)));
  ctx.fillStyle = RED; ctx.font = `700 ${size}px ${serif}`; ctx.fillText(han, W / 2, 310 + 165 + size * 0.36);

  // Pinyin trong viên thuốc đỏ
  if (pinyin) {
    ctx.font = `700 52px ${sans}`;
    const w = Math.min(W - 240, ctx.measureText(pinyin).width + 90);
    ctx.fillStyle = RED; roundRect(ctx, (W - w) / 2, 676, w, 84, 42); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(pinyin, W / 2, 735);
  }

  // Câu tóm tắt ý nghĩa
  let y = 830;
  if (summary) {
    ctx.fillStyle = GOLD; ctx.font = `700 70px ${serif}`; ctx.fillText("“", W / 2, y + 10);
    ctx.fillStyle = INK; ctx.font = `italic 600 42px ${sans}`;
    const rows = wrap(ctx, summary, 760).slice(0, 4);
    rows.forEach((r, i) => ctx.fillText(r, W / 2, y + 66 + i * 58));
    y += 66 + rows.length * 58 + 6;
  }

  // Nghĩa từng chữ (nhỏ hơn câu tóm tắt)
  ctx.font = `600 34px ${sans}`; ctx.fillStyle = "#6a5444";
  const room = Math.max(0, Math.floor((H - 190 - y) / 52));
  lines.slice(0, Math.min(4, room)).forEach((l, i) => ctx.fillText(l, W / 2, y + 30 + i * 52));

  // Ấn đỏ góc phải trên
  ctx.save(); ctx.translate(W - 190, 190); ctx.rotate(0.1);
  ctx.fillStyle = DARK_RED; roundRect(ctx, -46, -46, 92, 92, 10); ctx.fill();
  ctx.strokeStyle = "#ffd9c9"; ctx.lineWidth = 3; roundRect(ctx, -38, -38, 76, 76, 6); ctx.stroke();
  ctx.fillStyle = "#ffe8dc"; ctx.font = `700 58px ${serif}`; ctx.fillText("名", 0, 20);
  ctx.restore();

  // Chân thẻ
  ctx.fillStyle = RED; ctx.font = `800 34px ${sans}`; ctx.fillText("SongHanzi · songhanzi.com/ten-tieng-trung", W / 2, H - 120);
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no_blob"))), "image/png"));
}
