import { chipRows, confetti, sparkles, type ShareChip } from "@/lib/pet/pet-share";

const W = 1080;
const H = 1350;

export interface ShareImageInput { svg: SVGSVGElement; name: string; subtitle: string; stars: number; chips: ShareChip[]; tint: string }

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.22;
    ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad);
  }
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

async function svgToImage(svg: SVGSVGElement): Promise<HTMLImageElement> {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", "640");
  clone.setAttribute("height", "640");
  const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(clone)], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Vẽ thẻ khoe thành ảnh PNG 1080×1350 (tia nắng, lấp lánh, confetti, dải ánh ngũ sắc, viền cầu vồng) giống thẻ trên màn hình. Ném lỗi nếu trình duyệt không vẽ được. */
export async function renderShareImage({ svg, name, subtitle, stars, chips, tint }: ShareImageInput): Promise<Blob> {
  const pet = await svgToImage(svg);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no_canvas");
  const font = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

  // Viền cầu vồng, rồi nền thẻ.
  const rainbow = ctx.createLinearGradient(0, 0, W, H);
  ["#ff6b9d", "#ffb347", "#ffe66d", "#6bdc9a", "#5bc8ff", "#a78bfa", "#ff6b9d"].forEach((c, i) => rainbow.addColorStop(i / 6, c));
  ctx.fillStyle = rainbow;
  roundRect(ctx, 0, 0, W, H, 72); ctx.fill();
  ctx.save();
  roundRect(ctx, 16, 16, W - 32, H - 32, 58); ctx.clip();
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, tint); bg.addColorStop(0.55, "#ffffff"); bg.addColorStop(1, tint);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Tia nắng từ sau pet.
  ctx.save();
  ctx.translate(W / 2, 560);
  for (let i = 0; i < 16; i++) {
    ctx.rotate((Math.PI * 2) / 16);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-90, -900); ctx.lineTo(90, -900); ctx.closePath();
    if (i % 2 === 0) ctx.fill();
  }
  ctx.restore();

  // Vầng sáng sau pet.
  const halo = ctx.createRadialGradient(W / 2, 560, 40, W / 2, 560, 420);
  halo.addColorStop(0, "rgba(255,255,255,0.95)"); halo.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = halo; ctx.fillRect(0, 0, W, H);

  // Confetti.
  confetti(34).forEach((c, i) => {
    ctx.save();
    ctx.translate((c.x / 100) * W, 80 + ((i * 97) % 700));
    ctx.rotate((c.spin * Math.PI) / 180);
    ctx.fillStyle = `hsl(${c.hue} 90% 62% / 0.85)`;
    ctx.fillRect(-c.w, -c.w * 1.6, c.w * 2, c.w * 3.2);
    ctx.restore();
  });

  ctx.drawImage(pet, W / 2 - 310, 210, 620, 620);

  // Lấp lánh có quầng sáng.
  sparkles(18).forEach((s) => {
    ctx.save();
    ctx.shadowColor = "rgba(255,200,60,0.9)"; ctx.shadowBlur = 24;
    ctx.fillStyle = "#ffc531";
    star(ctx, (s.x / 100) * W, (s.y / 100) * 880 + 60, 14 + s.size * 16);
    ctx.restore();
  });

  // Dải ánh ngũ sắc chéo như thẻ hologram.
  const holo = ctx.createLinearGradient(0, 0, W, H * 0.7);
  holo.addColorStop(0.25, "rgba(255,255,255,0)"); holo.addColorStop(0.4, "rgba(255,120,220,0.16)");
  holo.addColorStop(0.5, "rgba(120,255,255,0.2)"); holo.addColorStop(0.6, "rgba(255,240,120,0.16)"); holo.addColorStop(0.75, "rgba(255,255,255,0)");
  ctx.fillStyle = holo; ctx.fillRect(0, 0, W, H);

  // Tên (chữ vàng kim), loài, sao giai đoạn.
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  const gold = ctx.createLinearGradient(W / 2 - 260, 0, W / 2 + 260, 0);
  gold.addColorStop(0, "#c2410c"); gold.addColorStop(0.5, "#f59e0b"); gold.addColorStop(1, "#c2410c");
  ctx.font = `800 104px ${font}`;
  ctx.lineWidth = 10; ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.strokeText(name, W / 2, 900);
  ctx.fillStyle = gold; ctx.fillText(name, W / 2, 900);
  ctx.font = `600 40px ${font}`; ctx.fillStyle = "#5b4636"; ctx.fillText(subtitle, W / 2, 958);
  ctx.font = `700 54px ${font}`; ctx.fillStyle = "#f59e0b"; ctx.fillText("★".repeat(stars) + "☆".repeat(3 - stars), W / 2, 1026);

  // Ô số liệu.
  // Ô rộng theo số ô trong hàng (cùng cách chia với thẻ trên màn hình): hàng 3 ô hẹp hơn, hàng 2 ô rộng hơn nên 2×2 hoặc 3+2 đều cân.
  const gap = 24;
  const rows = chipRows(chips.length);
  const bounds = rows.map((n, r) => ({ n, start: rows.slice(0, r).reduce((a, b) => a + b, 0) }));
  chips.forEach((c, i) => {
    const row = bounds.findIndex((b) => i >= b.start && i < b.start + b.n);
    const { n: inRow, start } = bounds[row];
    const cw = inRow >= 3 ? 280 : 400;
    const x = (W - (inRow * cw + (inRow - 1) * gap)) / 2 + (i - start) * (cw + gap);
    const y = 1066 + row * 96;
    ctx.fillStyle = "rgba(255,255,255,0.85)"; roundRect(ctx, x, y, cw, 80, 24); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = "#3a2b2b"; ctx.stroke();
    ctx.fillStyle = "#3a2b2b"; ctx.font = `800 34px ${font}`; ctx.fillText(c.value, x + cw / 2, y + 38);
    ctx.fillStyle = "#6b5b4b"; ctx.font = `600 22px ${font}`; ctx.fillText(c.label, x + cw / 2, y + 66);
  });
  ctx.fillStyle = "#6b5b4b"; ctx.font = `700 28px ${font}`; ctx.fillText("SongHanzi · học tiếng Trung qua bài hát", W / 2, H - 52);
  ctx.restore();

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("no_blob"))), "image/png"));
}
