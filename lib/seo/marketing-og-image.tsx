import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { loadCjkGlyphFont, loadOgFonts } from "@/lib/streak/og-fonts";

export const MARKETING_OG_SIZE = { width: 1200, height: 630 };
export const MARKETING_OG_ALT = "SongHanzi: học tiếng Trung qua bài hát, dành cho người Việt";

const PRIMARY = "#b03a2e";
const INK = "#1c1611";
const MUTED = "#5c5147";

/**
 * Ảnh xem trước (og:image và twitter:image) của trang giới thiệu: logo và tên SongHanzi, lời hứa của sản phẩm và chữ 歌 làm nền, cùng tông màu
 * với trang. Dựng bằng code nên đổi chữ hay thương hiệu chỉ cần sửa file này (không cần xuất lại ảnh).
 */
export async function renderMarketingOgImage(): Promise<ImageResponse> {
  // Ảnh này được dựng lúc build: không tải được font (mất mạng, Google lỗi) thì vẫn dựng bằng font mặc định thay vì làm hỏng cả lần deploy.
  const [fonts, cjk, mark] = await Promise.all([
    loadOgFonts().catch(() => []),
    loadCjkGlyphFont("歌").then((f) => [f]).catch(() => []),
    readFile(path.join(process.cwd(), "public", "songhanzi-mark-light.png")),
  ]);
  const markUrl = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: "linear-gradient(135deg, #fff8f4 0%, #fbe4dc 55%, #d6eceb 100%)" }}>
        <div style={{ position: "absolute", right: 40, bottom: -70, display: "flex", fontSize: 520, fontWeight: 700, color: "rgba(176, 58, 46, 0.08)", fontFamily: "serif-cjk", lineHeight: 1 }}>歌</div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 72px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 84, height: 84, borderRadius: 24, background: "#ffffff", boxShadow: "0 4px 18px rgba(176, 58, 46, 0.18)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) không dùng next/image */}
              <img src={markUrl} width={68} height={68} alt="" />
            </div>
            <div style={{ display: "flex", marginLeft: 22, fontSize: 52, fontWeight: 700, fontFamily: "serif-bold", color: INK }}>
              Song<span style={{ color: PRIMARY }}>Hanzi</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 700, fontFamily: "serif-bold", color: INK, lineHeight: 1.12 }}>Nghe một bài hát,</div>
            <div style={{ display: "flex", fontSize: 84, fontWeight: 700, fontFamily: "serif-bold", color: PRIMARY, lineHeight: 1.12 }}>nhớ cả trăm chữ Hán.</div>
            <div style={{ display: "flex", flexDirection: "column", marginTop: 30, fontSize: 32, color: MUTED, lineHeight: 1.45 }}>
              <div style={{ display: "flex" }}>Học tiếng Trung qua bài hát, dành cho người Việt</div>
              <div style={{ display: "flex" }}>Pinyin · âm Hán Việt · flashcard FSRS</div>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...MARKETING_OG_SIZE, fonts: [...fonts, ...cjk] },
  );
}
