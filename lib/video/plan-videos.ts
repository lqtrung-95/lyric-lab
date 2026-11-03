import type { SupabaseClient } from "@supabase/supabase-js";
import { existingVideoIds } from "./ingest-video";
import { fetchVideosMeta } from "./youtube-data-api";

/** Một video trong danh sách chờ nạp ở trang quản trị. */
export interface PlanVideo { videoId: string; title: string; channelTitle: string; durationSec: number; embeddable: boolean; exists: boolean }

/** Thông tin (tên, kênh, thời lượng, nhúng được) và cờ "đã có trong kho" cho một loạt mã video; mã YouTube không trả về thì bị bỏ. */
export async function buildPlanVideos(sb: SupabaseClient, ids: string[], key: string): Promise<PlanVideo[]> {
  const [meta, have] = await Promise.all([fetchVideosMeta(ids, key), existingVideoIds(sb, ids)]);
  return ids.flatMap((id) => {
    const m = meta.get(id);
    return m ? [{ videoId: id, title: m.title, channelTitle: m.channelTitle, durationSec: m.durationSec, embeddable: m.embeddable, exists: have.has(id) }] : [];
  });
}
