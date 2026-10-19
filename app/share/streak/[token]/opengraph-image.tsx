import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/seo/site-url";
import { loadOgFonts } from "@/lib/streak/og-fonts";
import { getStreakShare } from "./get-streak-share";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

const PRIMARY = "#944a00";
const SECONDARY = "#3b6931";
const INK = "#2c1d11";
const MUTED = "#5c4a3a";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [share, fonts] = await Promise.all([getStreakShare(token), loadOgFonts()]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fef9ed", position: "relative" }}>
        <div style={{ display: "flex", width: "100%", height: 14, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "76px 90px 90px", position: "relative" }}>
          <div style={{ position: "absolute", right: -40, bottom: -40, fontSize: 760, fontWeight: 700, color: "rgba(148, 74, 0, 0.06)", fontFamily: "serif-bold" }}>歌</div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: INK, fontFamily: "serif-bold" }}>SongHanzi</div>
          <div style={{ display: "flex", marginTop: 30, fontSize: 42, color: MUTED }}>Chuỗi ngày học tiếng Trung qua bài hát</div>
          <div style={{ display: "flex", marginTop: 80, fontSize: 300, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold", lineHeight: 1 }}>{share?.currentStreak ?? 0}</div>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: INK }}>ngày liên tiếp</div>
          <div style={{ display: "flex", marginTop: 60, gap: 28 }}>
            {[["từ đã ôn", share?.learnedWords ?? 0], ["ngày học tuần này", share?.weekCount ?? 0]].map(([label, value]) => (
              <div key={label as string} style={{ display: "flex", flexDirection: "column", width: 400, padding: "28px 32px", borderRadius: 28, background: "rgba(44, 29, 17, 0.04)" }}>
                <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: PRIMARY, fontFamily: "serif-bold" }}>{value}</div>
                <div style={{ display: "flex", fontSize: 36, color: MUTED }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", position: "absolute", left: 90, right: 90, bottom: 210, height: 2, background: "rgba(44, 29, 17, 0.12)" }} />
          <div style={{ display: "flex", position: "absolute", left: 90, bottom: 150, fontSize: 34, color: MUTED }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
