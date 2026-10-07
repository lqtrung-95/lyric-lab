import { ImageResponse } from "next/og";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { getChallengeInfo } from "@/lib/challenges/challenge-repo";
import { SITE_URL } from "@/lib/seo/site-url";
import { loadOgFonts } from "@/lib/streak/og-fonts";

export const runtime = "nodejs";
const size = { width: 1200, height: 630 };

const PRIMARY = "#b03a2e";
const SECONDARY = "#2e6b5e";
const INK = "#1c1611";
const MUTED = "#5c5147";

/** GET → ảnh xem trước (PNG 1200×630, dùng làm og:image) của link thử thách: người thách, điểm cao nhất, số câu. Không có tên bài hay lời (bản quyền, và font không có chữ Hán). */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await ctx.params).code);
  const [info, fonts] = await Promise.all([code ? getChallengeInfo(code, null).catch(() => null) : null, loadOgFonts()]);
  const best = info?.standings[0]?.points;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff8f4" }}>
        <div style={{ display: "flex", width: "100%", height: 12, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "56px 80px", position: "relative" }}>
          <div style={{ position: "absolute", right: 20, bottom: -120, fontSize: 560, fontWeight: 700, color: "rgba(176, 58, 46, 0.07)", fontFamily: "serif-bold" }}>歌</div>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: INK, fontFamily: "serif-bold" }}>SongHanzi</div>
          <div style={{ display: "flex", marginTop: 56, fontSize: 30, fontWeight: 700, color: PRIMARY, letterSpacing: 3 }}>THỬ THÁCH</div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 76, fontWeight: 700, color: INK, fontFamily: "serif-bold", lineHeight: 1.1, maxWidth: 1000 }}>
            {info ? `${info.creatorName} thách bạn!` : "Thử thách điền lời"}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 38, color: MUTED }}>
            {best !== undefined ? `Điểm cao nhất: ${best}. Vượt qua được không?` : "10 câu điền lời, mỗi câu 15 giây."}
          </div>
          <div style={{ display: "flex", position: "absolute", left: 80, bottom: 52, fontSize: 30, color: MUTED }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" }, fonts: [{ name: "sans", data: fonts.sans, weight: 400 }, { name: "serif-bold", data: fonts.serifBold, weight: 700 }] },
  );
}
