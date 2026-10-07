// Tải font WOFF (ImageResponse/satori không đọc được woff2) từ Google Fonts lúc chạy, cache lại cho các lần sau
// cùng tiến trình server. User-Agent cũ để Google trả link .woff thay vì .woff2 (satori chỉ hỗ trợ ttf/otf/woff).
const OLD_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) Safari/534.34";

const TONES = ["̀", "́", "̃", "̉", "̣"];
const VOWELS = "aăâeêioôơuưyAĂÂEÊIOÔƠUƯY";

/**
 * Bộ ký tự cần cho ảnh: ASCII in được, mọi chữ tiếng Việt có dấu (dựng sẵn dạng NFC) và vài dấu câu. Dùng tham số `text` của Google Fonts để
 * nhận MỘT file font chứa đủ các ký tự này: nếu lấy từng khối unicode-range (latin, vietnamese…) làm các font riêng cùng tên thì satori chỉ
 * dùng một khối, các chữ còn lại rơi về font khác và cùng một từ bị trộn hai kiểu chữ.
 */
const GLYPHS = (() => {
  const chars = new Set<string>();
  for (let c = 0x20; c < 0x7f; c++) chars.add(String.fromCharCode(c));
  for (const v of VOWELS) {
    chars.add(v);
    for (const t of TONES) chars.add((v + t).normalize("NFC"));
  }
  for (const c of "ĐđÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúý…·–—“”‘’") chars.add(c);
  return [...chars].join("");
})();

export interface OgFont {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
}

async function fetchFont(family: string, weight: 400 | 700, name: string): Promise<OgFont> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(GLYPHS)}`, { headers: { "User-Agent": OLD_UA } }).then((r) => r.text());
  const url = css.match(/url\((https:\/\/[^)]+)\) format\('woff'\)/)?.[1];
  if (!url) throw new Error(`Không tìm thấy URL font .woff cho ${family}`);
  return { name, weight, data: await fetch(url).then((r) => r.arrayBuffer()) };
}

let cached: Promise<OgFont[]> | null = null;

/** Font cho `ImageResponse`: Be Vietnam Pro (thường, đậm; tên "sans") và Lora (đậm; tên "serif-bold"), đủ chữ và dấu tiếng Việt. */
export function loadOgFonts(): Promise<OgFont[]> {
  cached ??= Promise.all([
    fetchFont("Be+Vietnam+Pro", 400, "sans"),
    fetchFont("Be+Vietnam+Pro", 700, "sans"),
    fetchFont("Lora", 700, "serif-bold"),
  ]);
  return cached;
}
