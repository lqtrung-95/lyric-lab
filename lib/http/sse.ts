/** Mã hóa một sự kiện Server-Sent Events: `event:` + `data:` (JSON một dòng) + dòng trống kết thúc. */
export function encodeSseEvent(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}
