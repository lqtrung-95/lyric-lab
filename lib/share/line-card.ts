import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";
import { balancedWrapText } from "./wrap-text";

const THUMB_W = 272;
const THUMB_H = 153;

/** Ảnh bìa YouTube (16:9) để vẽ lên thẻ. YouTube cho phép đọc ảnh chéo nguồn (CORS *) nên canvas không bị "nhiễm"; lỗi mạng hoặc quá 4 giây thì bỏ ảnh, thẻ vẫn vẽ bình thường. */
function loadThumbnail(videoId: string | undefined): Promise<HTMLImageElement | null> {
  if (!videoId || !isValidVideoId(videoId)) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => resolve(null), 4000);
    img.onload = () => { clearTimeout(timer); resolve(img.naturalWidth > 0 ? img : null); };
    img.onerror = () => { clearTimeout(timer); resolve(null); };
    img.src = videoThumbnailUrl(videoId, "mqdefault");
  });
}

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
  /** Có thì vẽ ảnh bìa video ở chân thẻ cạnh tên bài. */
  videoId?: string;
  /** Tên miền hiển thị cuối thẻ (không có giao thức). */
  site: string;
}

/**
 * Vẽ thẻ chia sẻ MỘT câu lời (PNG) ngay trên trình duyệt, cùng phong cách thẻ chuỗi ngày học. Chỉ một dòng lời kèm nghĩa tiếng Việt,
 * không tạo trang công khai chứa lời (quy tắc bản quyền của dự án). Dòng quá dài bị cắt bớt ở cuối.
 */
export async function renderLineCard(d: LineCardData): Promise<Blob> {
  const thumbnail = loadThumbnail(d.videoId); // tải song song với font
  await document.fonts.ready;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const c = canvas.getContext("2d")!;
  const sans = "'Be Vietnam Pro', system-ui, sans-serif";
  const serif = "Lora, Georgia, serif";
  const hanFont = `600 96px "Noto Serif SC", ${serif}`;
  // Font chữ Hán của trang chia thành hàng chục mảnh theo unicode-range và theo từng độ đậm, trình duyệt chỉ tải mảnh khi trang cần vẽ chữ đó ở ĐÚNG độ đậm
  // ấy. `fonts.ready` không đợi các mảnh này nên canvas vẽ ngay: chữ nào có sẵn mảnh (vd. từ vựng in đậm trên trang) dùng Noto, chữ còn lại rơi về font hệ
  // thống với nét đậm nhạt khác. Yêu cầu tải đúng chữ, đúng độ đậm sắp vẽ rồi mới vẽ.
  await Promise.all([
    document.fonts.load(hanFont, d.han),
    document.fonts.load(`600 40px ${sans}`, `${d.title}${d.artist ?? ""}`),
  ]).catch(() => undefined);
  const thumb = await thumbnail;
  // Có ảnh bìa thì chân thẻ cao hơn: đường kẻ và vùng chữ giữa dời lên tương ứng.
  const footerTop = thumb ? 1092 : 1130;
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

  // Ba khối (chữ Hán, pinyin, bản dịch) cách nhau đúng một khoảng GAP và cả cụm được căn giữa trong vùng giữa tiêu đề và đường kẻ chân thẻ,
  // nên thẻ cân đối dù câu ngắn hay dài. Mỗi khối ngắt dòng cân bằng để không có dòng cuối chỉ một, hai chữ.
  const limit = (lines: string[]) => (lines.length > MAX_LINES ? [...lines.slice(0, MAX_LINES - 1), `${lines[MAX_LINES - 1]}…`] : lines);
  const pinyinFont = `400 40px ${sans}`;
  const translationFont = `italic 400 46px ${sans}`;
  const blocks: { lines: string[]; font: string; color: string; lineHeight: number }[] = [
    { lines: limit(balancedWrapText(d.han, measureWith(hanFont), maxWidth, "char")), font: hanFont, color: INK, lineHeight: 132 },
  ];
  if (d.pinyin) blocks.push({ lines: limit(balancedWrapText(d.pinyin, measureWith(pinyinFont), maxWidth, "word")), font: pinyinFont, color: PRIMARY, lineHeight: 58 });
  if (d.translation) blocks.push({ lines: limit(balancedWrapText(`“${d.translation}”`, measureWith(translationFont), maxWidth, "word")), font: translationFont, color: MUTED, lineHeight: 66 });

  const GAP = 52;
  const regionTop = 230;
  const regionBottom = footerTop - 40;
  const total = blocks.reduce((sum, b) => sum + b.lines.length * b.lineHeight, 0) + GAP * (blocks.length - 1);
  let y = regionTop + Math.max(0, (regionBottom - regionTop - total) / 2);
  c.textBaseline = "middle";
  for (const b of blocks) {
    c.fillStyle = b.color;
    c.font = b.font;
    for (const line of b.lines) { c.fillText(line, left, y + b.lineHeight / 2); y += b.lineHeight; }
    y += GAP;
  }
  c.textBaseline = "alphabetic";

  c.strokeStyle = "rgba(28, 22, 17, 0.12)";
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(left, footerTop);
  c.lineTo(W - left, footerTop);
  c.stroke();
  const heading = d.artist ? `${d.title} · ${d.artist}` : d.title;
  if (thumb) {
    // Chân thẻ có ảnh bìa: ảnh bo góc bên trái, tên bài (tối đa 2 dòng) và tên miền căn giữa theo chiều dọc bên phải ảnh.
    const thumbY = footerTop + 40;
    const textLeft = left + THUMB_W + 32;
    const textWidth = W - left - textLeft;
    const titleFont = `600 36px ${sans}`;
    const titleLines = balancedWrapText(heading, measureWith(titleFont), textWidth, "word").slice(0, 2);
    if (balancedWrapText(heading, measureWith(titleFont), textWidth, "word").length > 2) titleLines[1] = `${titleLines[1]}…`;
    c.save();
    c.shadowColor = "rgba(28, 22, 17, 0.25)";
    c.shadowBlur = 18;
    c.shadowOffsetY = 6;
    c.beginPath();
    c.roundRect(left, thumbY, THUMB_W, THUMB_H, 18);
    c.fillStyle = "#e9ded6";
    c.fill();
    c.restore();
    c.save();
    c.beginPath();
    c.roundRect(left, thumbY, THUMB_W, THUMB_H, 18);
    c.clip();
    c.drawImage(thumb, left, thumbY, THUMB_W, THUMB_H);
    c.restore();
    const total = titleLines.length * 46 + 14 + 34;
    let y = thumbY + (THUMB_H - total) / 2;
    c.textBaseline = "middle";
    c.fillStyle = INK;
    c.font = titleFont;
    for (const line of titleLines) { c.fillText(line, textLeft, y + 23); y += 46; }
    c.fillStyle = MUTED;
    c.font = `400 30px ${sans}`;
    c.fillText(d.site, textLeft, y + 14 + 17);
    c.textBaseline = "alphabetic";
  } else {
    c.fillStyle = INK;
    c.font = `600 40px ${sans}`;
    c.fillText(heading, left, 1195, maxWidth);
    c.fillStyle = MUTED;
    c.font = `400 34px ${sans}`;
    c.fillText(`Học tiếng Trung qua bài hát · ${d.site}`, left, 1255, maxWidth);
  }

  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png"));
}
