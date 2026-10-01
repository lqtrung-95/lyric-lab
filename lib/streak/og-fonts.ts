// Tải font WOFF (ImageResponse/satori không đọc được woff2) từ Google Fonts lúc chạy, cache lại cho các lần sau
// cùng tiến trình server. User-Agent cũ để Google trả link .woff thay vì .woff2 (satori chỉ hỗ trợ ttf/otf/woff).
const OLD_UA = "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.34 (KHTML, like Gecko) Safari/534.34";

async function fetchFont(family: string, weight: number): Promise<ArrayBuffer> {
  const css = await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}`, { headers: { "User-Agent": OLD_UA } }).then((r) => r.text());
  // Google trả nhiều khối @font-face theo unicode-range (latin, vietnamese...); lấy khối "vietnamese" để có đủ dấu.
  const url = css.match(/\/\* vietnamese \*\/[\s\S]*?url\((https:\/\/[^)]+\.woff)\)/)?.[1] ?? css.match(/url\((https:\/\/[^)]+\.woff)\)/)?.[1];
  if (!url) throw new Error(`Không tìm thấy URL font .woff cho ${family}`);
  return fetch(url).then((r) => r.arrayBuffer());
}

let cached: Promise<{ sans: ArrayBuffer; sansBold: ArrayBuffer; serifBold: ArrayBuffer }> | null = null;

/** Font Be Vietnam Pro (thường/đậm) và Lora (đậm) — đủ dấu tiếng Việt, dùng cho ảnh og:image chuỗi ngày học. */
export function loadOgFonts() {
  cached ??= Promise.all([
    fetchFont("Be+Vietnam+Pro", 400),
    fetchFont("Be+Vietnam+Pro", 700),
    fetchFont("Lora", 700),
  ]).then(([sans, sansBold, serifBold]) => ({ sans, sansBold, serifBold }));
  return cached;
}
