/**
 * Giới hạn tần suất theo khóa (IP) trong cửa sổ trượt, lưu trong bộ nhớ tiến trình.
 * Chỉ là lớp chặn thô cho M2: trên serverless mỗi instance có bộ đếm riêng nên giới hạn không chính xác tuyệt đối.
 * Giới hạn theo tài khoản ẩn danh (PRD §7: 10 bài mới/ngày) làm ở M3.
 */
export class InMemoryRateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Trả true và ghi nhận một lượt nếu còn hạn mức; false nếu đã hết. */
  tryConsume(key: string): boolean {
    const t = this.now();
    const recent = (this.hits.get(key) ?? []).filter((h) => t - h < this.windowMs);
    if (recent.length >= this.limit) {
      this.hits.set(key, recent);
      return false;
    }
    this.hits.set(key, [...recent, t]);
    return true;
  }
}
