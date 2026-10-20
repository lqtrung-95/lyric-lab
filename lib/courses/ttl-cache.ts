/**
 * Bộ nhớ đệm trong tiến trình có hạn dùng và giới hạn số mục (xóa mục cũ nhất khi đầy). Dùng cho nội dung chặng: dữ liệu công khai, ít đổi, mỗi lần dựng tốn nhiều truy vấn.
 * Chỉ có tác dụng trong cùng một instance máy chủ; instance khác tự dựng lại, không ảnh hưởng tính đúng.
 */
export class TtlCache<V> {
  private readonly items = new Map<string, { value: V; expires: number }>();
  constructor(private readonly ttlMs: number, private readonly maxItems: number, private readonly now: () => number = Date.now) {}

  get(key: string): V | undefined {
    const hit = this.items.get(key);
    if (!hit) return undefined;
    if (hit.expires <= this.now()) { this.items.delete(key); return undefined; }
    return hit.value;
  }

  set(key: string, value: V): void {
    this.items.delete(key);
    this.items.set(key, { value, expires: this.now() + this.ttlMs });
    if (this.items.size > this.maxItems) this.items.delete(this.items.keys().next().value as string);
  }
}
