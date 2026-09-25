export type ShortcutAction = "togglePlay" | "prevLine" | "nextLine" | "toggleLoop";

interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  target: { tagName?: string; isContentEditable?: boolean } | null;
}

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Phím tắt màn Nghe (LS-10): Space phát/dừng, ←/→ câu trước/sau, L lặp câu. Bỏ qua khi đang gõ trong ô nhập,
 * khi có phím bổ trợ (Ctrl/Cmd/Alt) và khi phím Space đang nằm trên một nút (để nút tự xử lý).
 */
export function resolveShortcut(e: KeyLike): ShortcutAction | null {
  if (e.ctrlKey || e.metaKey || e.altKey) return null;
  const tag = e.target?.tagName?.toUpperCase();
  if ((tag && TYPING_TAGS.has(tag)) || e.target?.isContentEditable) return null;
  switch (e.key) {
    case " ":
      return tag === "BUTTON" || tag === "A" ? null : "togglePlay";
    case "ArrowLeft":
      return "prevLine";
    case "ArrowRight":
      return "nextLine";
    case "l":
    case "L":
      return "toggleLoop";
    default:
      return null;
  }
}
