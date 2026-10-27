import { alignPinyin } from "@/lib/pinyin/align-ruby";

/** Màu và cỡ chữ pinyin dưới chữ Hán; khoảng hở giữa chữ và pinyin mặc định nhỏ, chỗ có gạch chân (truyện của cảnh) đặt `--rt-gap` lớn hơn trên thẻ bao ngoài; chỗ nền cố định (bong bóng thoại) truyền màu riêng qua `rtClassName`. */
const RT_BASE = "mx-[0.1em] [ruby-position:under] [&_rt]:text-[0.6em] [&_rt]:font-semibold [&_rt]:pt-[var(--rt-gap,0.25em)] [&_rt]:leading-none [&_rt]:tracking-normal";

/** Một đoạn chữ Hán, mỗi chữ có pinyin ngay bên dưới (thẻ `<ruby>`); `py` là pinyin từng chữ của cả câu, `offset` là vị trí đoạn này trong câu. */
export function RubyChars({ text, py, offset = 0, rtClassName = "[&_rt]:text-primary" }: { text: string; py: string[] | null; offset?: number; rtClassName?: string }) {
  if (!py) return <>{text}</>;
  return (
    <>
      {Array.from(text).map((ch, i) => {
        const p = py[offset + i];
        return p ? <ruby key={i} className={`${RT_BASE} ${rtClassName}`}>{ch}<rp>(</rp><rt>{p}</rt><rp>)</rp></ruby> : <span key={i}>{ch}</span>;
      })}
    </>
  );
}

/**
 * Một câu tiếng Trung có pinyin ngay dưới từng chữ khi `show`. Không căn được pinyin theo chữ (lệch số âm tiết) thì hiện pinyin cả câu ở dòng dưới như cũ.
 * Không đặt `lang` ở đây: chỗ gọi tự đặt trên thẻ bao ngoài.
 */
export function RubyLine({ zh, pinyin, show, rtClassName, fallbackClassName = "text-primary" }: { zh: string; pinyin: string | undefined; show: boolean; rtClassName?: string; fallbackClassName?: string }) {
  if (!show || !pinyin) return <>{zh}</>;
  const py = alignPinyin(zh, pinyin);
  if (!py) return <>{zh}<span className={`block text-[0.7em] font-normal ${fallbackClassName}`}>{pinyin}</span></>;
  return <RubyChars text={zh} py={py} rtClassName={rtClassName} />;
}
