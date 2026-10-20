const KEY = "lyric-lab-last-course";
export const DEFAULT_COURSE = "hsk-1";

/** Khóa học người dùng xem gần nhất (để trang Học và thẻ lộ trình ở trang Hôm nay mở đúng cấp). Không đọc được thì dùng mặc định. */
export function readLastCourse(): string {
  try {
    const v = localStorage.getItem(KEY);
    return v && /^[a-z0-9-]{1,40}$/.test(v) ? v : DEFAULT_COURSE;
  } catch {
    return DEFAULT_COURSE;
  }
}

export function writeLastCourse(slug: string): void {
  try { localStorage.setItem(KEY, slug); } catch { /* không lưu được thì thôi */ }
}
