import { EmojiIcon } from "@/components/ui/emoji-icon";

/** Hàng tim mạng sống của game: tim đỏ còn lại, tim xám đã mất. Trang trí (`aria-hidden`); số mạng đã có ở nhãn của phần tử bao ngoài. */
export function Hearts({ lives, max, size = 18 }: { lives: number; max: number; size?: number }) {
  return <span aria-hidden="true" className="inline-flex items-center gap-0.5">{Array.from({ length: max }, (_, i) => <EmojiIcon key={i} e={i < lives ? "❤️" : "🖤"} size={size} />)}</span>;
}
