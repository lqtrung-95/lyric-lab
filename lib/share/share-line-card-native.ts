import { renderLineCard, type LineCardData } from "./line-card";

export type NativeShareResult = "shared" | "cancelled" | "unsupported";

/**
 * Chia sẻ thẻ một câu lời bằng share sheet của hệ điều hành (điện thoại): dựng ảnh trên máy rồi đưa file cho `navigator.share`, bỏ qua popup
 * xem trước. Trả "unsupported" khi máy không chia sẻ được file ảnh, hoặc khi share bị từ chối vì dựng ảnh quá lâu làm hết "lượt chạm" cho phép
 * (NotAllowedError); khi đó gọi bên ngoài hiện popup có sẵn nút Chia sẻ/Tải ảnh để người dùng bấm lại.
 */
export async function shareLineCardNative(card: Omit<LineCardData, "site">): Promise<NativeShareResult> {
  if (typeof navigator.share !== "function" || typeof navigator.canShare !== "function") return "unsupported";
  const blob = await renderLineCard({ ...card, site: location.host });
  const file = new File([blob], "songhanzi-cau-hat.png", { type: "image/png" });
  if (!navigator.canShare({ files: [file] })) return "unsupported";
  try {
    await navigator.share({ files: [file], title: "SongHanzi", text: `${card.han} · ${card.title}` });
    return "shared";
  } catch (e) {
    const name = (e as Error).name;
    if (name === "AbortError") return "cancelled";
    if (name === "NotAllowedError") return "unsupported";
    throw e;
  }
}
