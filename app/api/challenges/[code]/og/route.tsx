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

/**
 * GET → ảnh xem trước của link thử thách (PNG 1200×630, dùng làm og:image): tên người thách và điểm cao nhất. Không có tên bài hay lời
 * (bản quyền, và font không có chữ Hán). Tên người thách dài được cắt bớt để không tràn khung.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await ctx.params).code);
  const [info, fonts] = await Promise.all([code ? getChallengeInfo(code, null).catch(() => null) : null, loadOgFonts()]);
  const best = info?.standings[0]?.points;
  const headline = info ? `${info.creatorName.length > 18 ? `${info.creatorName.slice(0, 17)}…` : info.creatorName} thách bạn!` : "Thử thách điền lời";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff8f4", position: "relative" }}>
        <div style={{ display: "flex", width: "100%", height: 12, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        <div style={{ position: "absolute", right: -30, top: 30, display: "flex", fontSize: 520, fontWeight: 700, color: "rgba(176, 58, 46, 0.07)", fontFamily: "serif-bold" }}>歌</div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "48px 80px 52px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: INK, fontFamily: "serif-bold" }}>SongHanzi</div>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 700, color: PRIMARY, letterSpacing: 4 }}>THỬ THÁCH</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: INK, fontFamily: "serif-bold", lineHeight: 1.1 }}>{headline}</div>
            {best !== undefined ? (
              <div style={{ display: "flex", alignItems: "baseline", marginTop: 20 }}>
                <div style={{ display: "flex", fontSize: 150, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold", lineHeight: 1 }}>{best}</div>
                <div style={{ display: "flex", flexDirection: "column", marginLeft: 28 }}>
                  <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: INK }}>điểm cao nhất</div>
                  <div style={{ display: "flex", fontSize: 32, color: MUTED }}>Bạn vượt qua được không?</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", marginTop: 20, fontSize: 40, color: MUTED }}>Hãy là người đầu tiên đặt điểm chuẩn.</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 28, color: MUTED }}>
            <div style={{ display: "flex" }}>10 câu điền lời · 15 giây mỗi câu</div>
            <div style={{ display: "flex" }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" }, fonts },
  );
}
