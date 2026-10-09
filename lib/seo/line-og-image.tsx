import { ImageResponse } from "next/og";
import { balancedWrapText } from "@/lib/share/wrap-text";
import { loadCjkGlyphFont, loadOgFonts } from "@/lib/streak/og-fonts";
import { MARKETING_OG_SIZE } from "./marketing-og-image";

const PRIMARY = "#b03a2e";
const SECONDARY = "#2e6b5e";
const INK = "#1c1611";
const MUTED = "#5c5147";
const MAX_LINES = 3;
const CONTENT_WIDTH = 1200 - 2 * 88;
/** Mọi ký tự ngoài Latin/Việt (chữ Hán, dấu câu CJK): cần font chữ Hán con. */
const NON_LATIN = /[^\u0000-ɏḀ-ỿ\s]/g;

export interface LineOgData {
  han: string;
  pinyin?: string;
  translation?: string;
  title: string;
  artist?: string;
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);
const isWide = (ch: string) => ch.charCodeAt(0) >= 0x2e80;

/** Độ rộng ước lượng (không có canvas ở server): chữ Hán và dấu câu CJK rộng đúng một cỡ chữ, chữ Latin/dấu cách hẹp hơn. */
const estimateWidth = (size: number) => (s: string) => [...s].reduce((w, ch) => w + (isWide(ch) ? size : ch === " " ? size * 0.3 : size * 0.56), 0);

function lines(text: string, size: number, unit: "char" | "word"): string[] {
  const all = balancedWrapText(text, estimateWidth(size), CONTENT_WIDTH, unit);
  return all.length > MAX_LINES ? [...all.slice(0, MAX_LINES - 1), `${all[MAX_LINES - 1]}…`] : all;
}

/**
 * Ảnh xem trước khi dán link CHIA SẺ MỘT CÂU (og:image 1200×630): đúng một câu lời (chữ Hán + pinyin + nghĩa tiếng Việt) kèm tên bài và SongHanzi,
 * cùng bố cục với thẻ ảnh người dùng tải về. Chỉ một dòng lời, không có trang công khai chứa lời (quy tắc bản quyền, cho phép một câu cho thẻ chia sẻ).
 * Ba khối cách nhau đều nhau, mỗi khối ngắt dòng cân bằng và cả cụm căn giữa theo chiều dọc.
 */
export async function renderLineOgImage(d: LineOgData): Promise<ImageResponse> {
  // Vùng chữ giữa phần đầu và chân ảnh cao ~410px. Câu dài thì thu nhỏ cả ba khối cùng tỉ lệ cho tới khi vừa (không để chữ tràn lên tên bài/xuống chân ảnh).
  const baseHan = d.han.length > 22 ? 62 : d.han.length > 12 ? 76 : 92;
  const layoutAt = (k: number) => {
    const hanSize = Math.round(baseHan * k), pinyinSize = Math.round(34 * k), translationSize = Math.round(40 * k);
    const han = lines(d.han, hanSize, "char");
    const pinyin = d.pinyin ? lines(d.pinyin, pinyinSize, "word") : [];
    const translation = d.translation ? lines(`“${d.translation}”`, translationSize, "word") : [];
    const gaps = (pinyin.length > 0 ? 30 : 0) + (translation.length > 0 ? 30 : 0);
    const height = han.length * hanSize * 1.3 + pinyin.length * pinyinSize * 1.4 + translation.length * translationSize * 1.4 + gaps;
    return { hanSize, pinyinSize, translationSize, han, pinyin, translation, height };
  };
  const layout = [1, 0.88, 0.78, 0.7, 0.62].map(layoutAt).find((l) => l.height <= 410) ?? layoutAt(0.55);
  const { hanSize, pinyinSize, translationSize } = layout;
  const hanLines = layout.han, pinyinLines = layout.pinyin, translationLines = layout.translation;
  const meta = [clip(d.title, 46), d.artist ? clip(d.artist, 26) : ""].filter(Boolean).join(" · ");
  const cjk = [...new Set(`${hanLines.join("")}${meta}`.match(NON_LATIN) ?? [])].join("");
  const [fonts, cjkFont] = await Promise.all([loadOgFonts().catch(() => []), cjk ? loadCjkGlyphFont(cjk).then((f) => [f]).catch(() => []) : Promise.resolve([])]);
  const block = (children: string[], style: Record<string, string | number>) => (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {children.map((l, i) => <div key={i} style={{ display: "flex" }}>{l}</div>)}
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", position: "relative", background: "linear-gradient(135deg, #fff8f4 0%, #fbe4dc 55%, #d6eceb 100%)" }}>
        <div style={{ display: "flex", width: "100%", height: 12, background: `linear-gradient(90deg, ${PRIMARY}, ${SECONDARY})` }} />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "40px 88px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", fontSize: 38, fontWeight: 700, fontFamily: "serif-bold", color: INK }}>SongHanzi</div>
            <div style={{ display: "flex", fontSize: 26, color: MUTED, fontFamily: "sans, serif-cjk" }}>{meta}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
            {block(hanLines, { fontSize: hanSize, fontWeight: 700, fontFamily: "serif-bold, serif-cjk", color: INK, lineHeight: 1.3 })}
            {pinyinLines.length > 0 && block(pinyinLines, { marginTop: 30, fontSize: pinyinSize, fontFamily: "sans", color: PRIMARY, lineHeight: 1.4 })}
            {translationLines.length > 0 && block(translationLines, { marginTop: 30, fontSize: translationSize, fontFamily: "sans", color: MUTED, lineHeight: 1.4 })}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: MUTED, fontFamily: "sans" }}>Học tiếng Trung qua bài hát · songhanzi.com</div>
        </div>
      </div>
    ),
    { ...MARKETING_OG_SIZE, fonts: [...fonts, ...cjkFont] },
  );
}
