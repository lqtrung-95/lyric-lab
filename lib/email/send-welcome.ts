import "server-only";
import { claimWelcome, ensurePrefs, releaseWelcome } from "./email-prefs-repo";
import { isEmailConfigured, sendEmail } from "./email-sender";
import { oneClickUnsubscribeUrl, SITE_URL, unsubscribeUrl } from "./email-links";
import { renderWelcomeEmail } from "./email-templates";

/**
 * Gửi email chào mừng nếu người dùng có email thật và chưa được gửi (mỗi người đúng một lần: `claimWelcome` khóa bằng cập nhật có điều kiện).
 * Không bao giờ ném lỗi: việc gửi mail không được làm hỏng đăng nhập. Gửi lỗi thì trả quyền gửi để lần đăng nhập sau thử lại.
 */
export async function sendWelcomeIfNeeded(user: { id: string; email: string | null; isAnonymous: boolean }): Promise<void> {
  if (!isEmailConfigured() || !user.email || user.isAnonymous) return;
  let claimed = false;
  try {
    const prefs = await ensurePrefs(user.id);
    if (prefs.welcomeSentAt) return;
    claimed = await claimWelcome(user.id);
    if (!claimed) return;
    const mail = renderWelcomeEmail({ siteUrl: SITE_URL, unsubscribeUrl: unsubscribeUrl(prefs.unsubscribeToken) });
    await sendEmail({ to: user.email, ...mail, unsubscribeUrl: oneClickUnsubscribeUrl(prefs.unsubscribeToken) });
  } catch (error) {
    if (claimed) await releaseWelcome(user.id).catch(() => {});
    console.error(JSON.stringify({ event: "welcome_email_error", message: (error as Error)?.message }));
  }
}
