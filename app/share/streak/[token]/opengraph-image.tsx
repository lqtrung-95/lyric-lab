import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo/site-url";
import { loadOgFonts } from "@/lib/streak/og-fonts";
import { getStreakShare } from "./get-streak-share";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

const PRIMARY = "#b03a2e";
const SECONDARY = "#2e6b5e";
const INK = "#1c1611";
const MUTED = "#5c5147";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [share, fonts] = await Promise.all([getStreakShare(token), loadOgFonts()]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff8f4", position: "relative" }}>
        <div style={{ display: "flex", width: "100%", height: 14, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "76px 90px 90px", position: "relative" }}>
          <div style={{ position: "absolute", right: -40, bottom: -40, fontSize: 760, fontWeight: 700, color: "rgba(176, 58, 46, 0.06)", fontFamily: "serif-bold" }}>歌</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", width: 20, height: 20, borderRadius: 10, background: PRIMARY }} />
            <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: INK, fontFamily: "serif-bold" }}>SongHanzi</div>
          </div>
          <div style={{ display: "flex", marginTop: 220, fontSize: 42, color: MUTED }}>Chuỗi ngày học tiếng Trung qua bài hát</div>
          <div style={{ display: "flex", marginTop: 40, fontSize: 300, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold", lineHeight: 1 }}>{share?.currentStreak ?? 0}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: INK }}>ngày liên tiếp</div>
          <div style={{ display: "flex", marginTop: 150, gap: 28 }}>
            {[["từ đã ôn", share?.learnedWords ?? 0], ["ngày học tuần này", share?.weekCount ?? 0]].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", flexDirection: "column", width: 400, padding: "28px 32px", borderRadius: 28, background: "rgba(28, 22, 17, 0.04)" }}>
                <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold" }}>{value}</div>
                <div style={{ display: "flex", fontSize: 36, color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", position: "absolute", left: 90, right: 90, bottom: 150, height: 2, background: "rgba(28, 22, 17, 0.12)" }} />
          <div style={{ display: "flex", position: "absolute", left: 90, bottom: 90, fontSize: 34, color: MUTED }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "sans", data: fonts.sans, weight: 400 }, { name: "serif-bold", data: fonts.serifBold, weight: 700 }] },
  );
}
