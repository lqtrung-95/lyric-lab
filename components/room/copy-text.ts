/** Chép văn bản vào clipboard; false khi trình duyệt chặn (nơi gọi báo cho người dùng tự chép). */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
