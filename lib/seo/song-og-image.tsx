import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { loadCjkGlyphFont, loadOgFonts } from "@/lib/streak/og-fonts";
import { MARKETING_OG_SIZE } from "./marketing-og-image";

const PRIMARY = "#b03a2e";
const INK = "#1c1611";
const MUTED = "#5c5147";
const HAN = /[㐀-鿿]/g;

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** Ảnh bìa YouTube của video (đã hiện sẵn trong app). Lỗi mạng hay hết giờ thì bỏ ảnh, thẻ vẫn dựng được chỉ với chữ. */
async function fetchThumbnail(videoId: string): Promise<string | null> {
  try {
    const res = await fetch(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    return `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Ảnh xem trước khi dán link một bài học (og:image, twitter:image): ảnh bìa video + tên bài + nghệ sĩ + thương hiệu SongHanzi. Chỉ có thông tin bài,
 * KHÔNG có lời bài hát (quy tắc bản quyền: trang bài học không công khai lời). Chữ Hán trong tên bài dùng font con chỉ chứa đúng các chữ cần.
 */
export async function renderSongOgImage({ videoId, title, artist }: { videoId: string; title: string; artist?: string }): Promise<ImageResponse> {
  const shownTitle = clip(title, 64);
  const shownArtist = artist ? clip(artist, 40) : "";
  const hanChars = [...new Set(`${shownTitle}${shownArtist}`.match(HAN) ?? [])].join("");
  const [fonts, cjk, thumb, mark] = await Promise.all([
    loadOgFonts().catch(() => []),
    hanChars ? loadCjkGlyphFont(hanChars).then((f) => [f]).catch(() => []) : Promise.resolve([]),
    fetchThumbnail(videoId),
    readFile(path.join(process.cwd(), "public", "songhanzi-mark-light.png")),
  ]);
  const markUrl = `data:image/png;base64,${mark.toString("base64")}`;
  const titleSize = shownTitle.length > 36 ? 44 : shownTitle.length > 20 ? 54 : 66;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(135deg, #fff8f4 0%, #fbe4dc 55%, #d6eceb 100%)", padding: 56 }}>
        {thumb && (
          <div style={{ display: "flex", alignItems: "center", marginRight: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) không dùng next/image */}
            <img src={thumb} width={460} height={259} alt="" style={{ borderRadius: 28, objectFit: "cover", boxShadow: "0 12px 40px rgba(28, 22, 17, 0.28)" }} />
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 18, background: "#ffffff", boxShadow: "0 4px 14px rgba(176, 58, 46, 0.18)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) không dùng next/image */}
              <img src={markUrl} width={50} height={50} alt="" />
            </div>
            <div style={{ display: "flex", marginLeft: 16, fontSize: 40, fontWeight: 700, fontFamily: "serif-bold", color: INK }}>
              Song<span style={{ color: PRIMARY }}>Hanzi</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, color: PRIMARY, fontWeight: 700, fontFamily: "sans", marginBottom: 14 }}>Học tiếng Trung qua bài hát này</div>
            <div style={{ display: "flex", fontSize: titleSize, fontWeight: 700, fontFamily: "serif-bold, serif-cjk", color: INK, lineHeight: 1.2 }}>{shownTitle}</div>
            {shownArtist && <div style={{ display: "flex", marginTop: 14, fontSize: 32, color: MUTED, fontFamily: "sans, serif-cjk" }}>{shownArtist}</div>}
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", padding: "10px 26px", borderRadius: 999, background: PRIMARY, color: "#ffffff", fontSize: 28, fontWeight: 700, fontFamily: "sans" }}>songhanzi.com</div>
          </div>
        </div>
      </div>
    ),
    { ...MARKETING_OG_SIZE, fonts: [...fonts, ...cjk] },
  );
}
