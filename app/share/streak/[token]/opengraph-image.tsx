import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/streak/og-fonts";
import { getStreakShare } from "./get-streak-share";

export const runtime = "nodejs";
export const size = { width: 1080, height: 1350 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [share, fonts] = await Promise.all([getStreakShare(token), loadOgFonts()]);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff8f4", position: "relative", padding: "90px" }}>
        <div style={{ position: "absolute", right: -40, bottom: -120, fontSize: 760, fontWeight: 700, color: "rgba(176, 58, 46, 0.07)", fontFamily: "serif-bold" }}>歌</div>
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700, color: "#1c1611", fontFamily: "serif-bold" }}>SongHanzi</div>
        <div style={{ display: "flex", marginTop: 220, fontSize: 42, color: "#5c5147" }}>Chuỗi ngày học tiếng Trung qua bài hát</div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 300, fontWeight: 700, color: "#b03a2e", fontFamily: "serif-bold", lineHeight: 1 }}>{share?.currentStreak ?? 0}</div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 600, color: "#1c1611" }}>ngày liên tiếp</div>
        <div style={{ display: "flex", marginTop: 150, gap: 460 }}>
          {[["từ đã ôn", share?.learnedWords ?? 0], ["ngày học tuần này", share?.weekCount ?? 0]].map(([label, value]) => (
            <div key={label as string} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", fontSize: 96, fontWeight: 700, color: "#1c1611", fontFamily: "serif-bold" }}>{value}</div>
              <div style={{ display: "flex", fontSize: 36, color: "#5c5147" }}>{label}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", position: "absolute", left: 90, bottom: 90, fontSize: 34, color: "#5c5147" }}>songhanzi.app</div>
      </div>
    ),
    { ...size, fonts: [{ name: "sans", data: fonts.sans, weight: 400 }, { name: "serif-bold", data: fonts.serifBold, weight: 700 }] },
  );
}
