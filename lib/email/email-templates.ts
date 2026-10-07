// Mẫu email (hàm thuần: nhận dữ liệu, trả {subject, html, text}). Giao diện dùng bảng và style nội tuyến vì các ứng dụng email không hỗ trợ CSS hiện đại.
const PRIMARY = "#b03a2e";
const INK = "#1c1611";
const MUTED = "#5c5147";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

interface Layout {
  siteUrl: string;
  heading: string;
  /** Các đoạn văn (đã là HTML an toàn). */
  body: string;
  cta: { label: string; href: string };
  unsubscribeUrl: string;
  /** Đoạn xám ngay trên link hủy: vì sao nhận email này. */
  why: string;
}

function layout({ siteUrl, heading, body, cta, unsubscribeUrl, why }: Layout): string {
  return `<!doctype html><html lang="vi"><body style="margin:0;background:#fff8f4;font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;color:${INK}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:20px;overflow:hidden" cellpadding="0" cellspacing="0">
<tr><td style="height:6px;background:linear-gradient(90deg,${PRIMARY},#2e6b5e)"></td></tr>
<tr><td style="padding:28px 28px 8px;font-family:Georgia,serif;font-size:22px;font-weight:700">SongHanzi</td></tr>
<tr><td style="padding:8px 28px 0;font-family:Georgia,serif;font-size:24px;font-weight:700;line-height:1.3">${esc(heading)}</td></tr>
<tr><td style="padding:12px 28px 4px;font-size:16px;line-height:1.6;color:${MUTED}">${body}</td></tr>
<tr><td style="padding:20px 28px 28px"><a href="${esc(cta.href)}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;font-weight:600;font-size:16px;padding:14px 28px;border-radius:999px">${esc(cta.label)}</a></td></tr>
<tr><td style="padding:16px 28px 24px;border-top:1px solid #eee;font-size:12px;line-height:1.5;color:#8a7f75">${esc(why)}<br><a href="${esc(unsubscribeUrl)}" style="color:#8a7f75">Hủy nhận email này</a> · <a href="${esc(siteUrl)}" style="color:#8a7f75">${esc(siteUrl.replace(/^https?:\/\//, ""))}</a></td></tr>
</table></td></tr></table></body></html>`;
}

const p = (s: string) => `<p style="margin:0 0 12px">${s}</p>`;
const b = (s: string | number) => `<strong style="color:${INK}">${esc(String(s))}</strong>`;

export interface EmailBase {
  siteUrl: string;
  unsubscribeUrl: string;
}

/** Chào mừng, gửi một lần khi tài khoản có email thật (đăng nhập Google lần đầu). */
export function renderWelcomeEmail({ siteUrl, unsubscribeUrl }: EmailBase): RenderedEmail {
  const href = `${siteUrl}/app`;
  const steps = ["Dán link YouTube hoặc chọn một bài gợi ý", "Xem trước từ vựng, rồi nghe với lời chạy theo nhạc", "Lưu từ hay và ôn mỗi ngày vài phút bằng thẻ nhớ"];
  const html = layout({
    siteUrl, heading: "Chào mừng bạn đến với SongHanzi!", cta: { label: "Bắt đầu học", href }, unsubscribeUrl,
    body: p("Học tiếng Trung qua chính những bài hát bạn thích. Chỉ cần 3 bước:") + `<ol style="margin:0 0 12px;padding-left:20px">${steps.map((s) => `<li style="margin-bottom:6px">${esc(s)}</li>`).join("")}</ol>` + p("Mỗi ngày học một chút là đủ. Chúc bạn học vui!"),
    why: "Bạn nhận email này vì vừa đăng nhập SongHanzi bằng Google.",
  });
  return { subject: "Chào mừng bạn đến với SongHanzi", html, text: `Chào mừng bạn đến với SongHanzi!\n\nChỉ cần 3 bước:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nBắt đầu học: ${href}\n\nHủy nhận email: ${unsubscribeUrl}` };
}

export interface WeeklyStats {
  activeDays: number;
  reviewed: number;
  songs: number;
  streak: number;
  dueCards: number;
}

/** Tổng kết 7 ngày qua. Chỉ gửi khi tuần đó có học (xem `shouldSendWeekly`). */
export function renderWeeklyEmail(base: EmailBase, s: WeeklyStats): RenderedEmail {
  const href = s.dueCards > 0 ? `${base.siteUrl}/review` : `${base.siteUrl}/app`;
  const rows: [string, string][] = [["Ngày đã học", `${s.activeDays}/7`], ["Thẻ đã ôn", String(s.reviewed)], ["Bài đã nghe", String(s.songs)], ["Chuỗi ngày hiện tại", `${s.streak} ngày`]];
  const table = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 12px">${rows.map(([k, v]) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0e9e3;color:${MUTED}">${esc(k)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid #f0e9e3;font-weight:700;color:${INK}">${esc(v)}</td></tr>`).join("")}</table>`;
  const nudge = s.dueCards > 0 ? p(`Bạn đang có ${b(s.dueCards)} thẻ đến hạn ôn. Vài phút là xong.`) : p("Tuần này bạn đã ôn hết thẻ đến hạn. Thử nghe một bài mới nhé!");
  const html = layout({
    siteUrl: base.siteUrl, heading: "Tuần qua của bạn", unsubscribeUrl: base.unsubscribeUrl,
    cta: { label: s.dueCards > 0 ? "Ôn thẻ ngay" : "Học tiếp", href },
    body: p(`Bạn đã học ${b(s.activeDays)} ngày trong 7 ngày qua. Giữ nhịp nhé!`) + table + nudge,
    why: "Bạn nhận tổng kết này mỗi tuần khi có học. Có thể tắt trong Cài đặt hoặc ngay bên dưới.",
  });
  const text = `Tuần qua của bạn\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\n${s.dueCards > 0 ? `Bạn có ${s.dueCards} thẻ đến hạn ôn.` : "Bạn đã ôn hết thẻ đến hạn."}\n${href}\n\nHủy nhận email: ${base.unsubscribeUrl}`;
  return { subject: `Tuần qua: bạn học ${s.activeDays} ngày`, html, text };
}

/** Nhắc quay lại khi lâu không học. */
export function renderReminderEmail(base: EmailBase, s: { inactiveDays: number; dueCards: number; streakLost: boolean }): RenderedEmail {
  const href = s.dueCards > 0 ? `${base.siteUrl}/review` : `${base.siteUrl}/app`;
  const lead = s.dueCards > 0 ? `Bạn có ${b(s.dueCards)} thẻ đang chờ ôn.` : "Có rất nhiều bài hát hay đang chờ bạn.";
  const html = layout({
    siteUrl: base.siteUrl, heading: `Đã ${s.inactiveDays} ngày bạn chưa học`, unsubscribeUrl: base.unsubscribeUrl,
    cta: { label: s.dueCards > 0 ? "Ôn thẻ ngay" : "Nghe một bài", href },
    body: p(lead) + p(s.streakLost ? "Chuỗi ngày học đã đứt, nhưng bắt đầu lại chỉ mất vài phút." : "Học đều mỗi ngày một chút giúp bạn nhớ lâu hơn."),
    why: "Bạn nhận email này vì đã vài ngày chưa học. Chúng tôi chỉ nhắc tối đa một lần mỗi tuần.",
  });
  return { subject: `Đã ${s.inactiveDays} ngày bạn chưa học tiếng Trung`, html, text: `Đã ${s.inactiveDays} ngày bạn chưa học.\n${s.dueCards > 0 ? `Bạn có ${s.dueCards} thẻ đang chờ ôn.` : "Quay lại nghe một bài nhé."}\n${href}\n\nHủy nhận email: ${base.unsubscribeUrl}` };
}
