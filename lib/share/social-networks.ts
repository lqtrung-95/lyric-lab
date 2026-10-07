export interface SocialNetwork {
  label: string;
  href: (url: string) => string;
}

/**
 * Nút chia sẻ link lên từng mạng (desktop không có share sheet của hệ điều hành). Facebook: sharer.php đã bỏ tham số text từ lâu, chỉ nhận link.
 * Instagram/TikTok không có link chia sẻ web công khai (chỉ nhận qua share sheet của app di động).
 */
export function socialNetworks(title: string, text: string): SocialNetwork[] {
  const e = encodeURIComponent;
  return [
    { label: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${e(u)}` },
    { label: "X", href: (u) => `https://twitter.com/intent/tweet?url=${e(u)}&text=${e(text)}` },
    { label: "Zalo", href: (u) => `https://zalo.me/share?u=${e(u)}&t=${e(title)}` },
    { label: "Telegram", href: (u) => `https://t.me/share/url?url=${e(u)}&text=${e(text)}` },
    { label: "Threads", href: (u) => `https://www.threads.net/intent/post?text=${e(`${text} ${u}`)}` },
  ];
}
