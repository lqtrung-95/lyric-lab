import { ImageResponse } from "next/og";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";
import { getChallengeInfo } from "@/lib/challenges/challenge-repo";
import { loadBrandMarkDataUrl } from "@/lib/seo/brand-mark";
import { SITE_URL } from "@/lib/seo/site-url";
import { loadOgFonts } from "@/lib/streak/og-fonts";

export const runtime = "nodejs";
const size = { width: 1200, height: 630 };

const PRIMARY = "#944a00";
const SECONDARY = "#3b6931";
const INK = "#2c1d11";
const MUTED = "#5c4a3a";

/**
 * GET → ảnh xem trước của link thử thách (PNG 1200×630, dùng làm og:image): tên người thách và điểm cao nhất. Không có tên bài hay lời
 * (bản quyền, và font không có chữ Hán). Tên người thách dài được cắt bớt để không tràn khung.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await ctx.params).code);
  const [info, fonts, mark] = await Promise.all([code ? getChallengeInfo(code, null).catch(() => null) : null, loadOgFonts(), loadBrandMarkDataUrl()]);
  const best = info?.standings[0]?.points;
  const headline = info ? `${info.creatorName.length > 18 ? `${info.creatorName.slice(0, 17)}…` : info.creatorName} thách bạn!` : "Thử thách điền lời";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fef9ed", position: "relative" }}>
        <div style={{ display: "flex", width: "100%", height: 12, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        {/* Chữ Hán làm nền nằm gọn ở góc phải dưới, không chồng lên khối chữ. */}
        <div style={{ position: "absolute", right: 56, bottom: 40, display: "flex", fontSize: 300, fontWeight: 700, color: "rgba(148, 74, 0, 0.07)", fontFamily: "serif-bold", lineHeight: 1 }}>歌</div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "44px 80px 48px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (satori) không dùng next/image */}
              {mark && <img src={mark} width={64} height={64} alt="" style={{ marginRight: 18 }} />}
              <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: INK, fontFamily: "serif-bold" }}>SongHanzi</div>
            </div>
            <div style={{ display: "flex", padding: "10px 24px", borderRadius: 999, background: "rgba(148, 74, 0, 0.1)", fontSize: 24, fontWeight: 700, color: PRIMARY, letterSpacing: 3 }}>THỬ THÁCH</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div style={{ display: "flex", fontSize: 68, fontWeight: 700, color: INK, fontFamily: "serif-bold", lineHeight: 1.15 }}>{headline}</div>
            {best !== undefined ? (
              <div style={{ display: "flex", alignItems: "center", marginTop: 32, padding: "26px 44px", borderRadius: 36, background: "rgba(148, 74, 0, 0.08)" }}>
                <div style={{ display: "flex", fontSize: 128, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold", lineHeight: 1 }}>{best}</div>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: 36 }}>
                  <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: INK }}>điểm cao nhất</div>
                  <div style={{ display: "flex", marginTop: 6, fontSize: 28, color: MUTED }}>Bạn vượt qua được không?</div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", marginTop: 28, fontSize: 38, color: MUTED }}>Hãy là người đầu tiên đặt điểm chuẩn.</div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 22, borderTop: "2px solid rgba(44, 29, 17, 0.1)", fontSize: 26, color: MUTED }}>
            <div style={{ display: "flex" }}>10 câu điền lời · 15 giây mỗi câu</div>
            <div style={{ display: "flex" }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" }, fonts },
  );
}
