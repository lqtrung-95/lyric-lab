import type { CaptionLine } from "./caption-provider-types";
import { CaptionError } from "./caption-errors";

interface Json3Event {
  tStartMs?: number;
  dDurationMs?: number;
  segs?: { utf8?: string }[];
}

/** Chuyển phản hồi `fmt=json3` của YouTube thành CaptionLine[] (giây). */
export function parseJson3CaptionEvents(body: string): CaptionLine[] {
  let data: { events?: Json3Event[] };
  try {
    data = JSON.parse(body);
  } catch (cause) {
    throw new CaptionError("parse", "Phản hồi caption không phải JSON", { cause });
  }
  if (!Array.isArray(data.events)) {
    throw new CaptionError("parse", "Phản hồi caption thiếu events");
  }

  const lines: CaptionLine[] = [];
  for (const ev of data.events) {
    if (!ev.segs || ev.tStartMs === undefined) continue;
    const text = ev.segs.map((s) => s.utf8 ?? "").join("").replace(/\n/g, " ").trim();
    if (!text) continue;
    const start = ev.tStartMs / 1000;
    lines.push({ text, start, end: start + (ev.dDurationMs ?? 0) / 1000 });
  }
  return lines;
}
