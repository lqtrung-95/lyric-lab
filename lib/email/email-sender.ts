import "server-only";

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Link hủy nhận một chạm: đưa vào header List-Unsubscribe (Gmail/Yahoo yêu cầu với email gửi hàng loạt). */
  unsubscribeUrl?: string;
}

/** Đủ biến môi trường để gửi email thật. Thiếu thì mọi tính năng email tự tắt (không lỗi). */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

/**
 * Gửi một email qua Resend (REST, không cần SDK). Trả true nếu nhà cung cấp nhận; ném lỗi khi bị từ chối để nơi gọi quyết định thử lại.
 * Nhà cung cấp chỉ nằm trong file này: đổi sang dịch vụ khác chỉ cần thay thân hàm.
 */
export async function sendEmail(mail: OutgoingEmail): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      headers: mail.unsubscribeUrl ? { "List-Unsubscribe": `<${mail.unsubscribeUrl}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } : undefined,
    }),
  });
  if (!res.ok) throw new Error(`email_provider_${res.status}`);
}
