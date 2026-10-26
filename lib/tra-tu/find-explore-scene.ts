import { SCENES } from "@/lib/explore/scenes";

/** Cảnh Khám phá có vật mang từ này (chỉ đọc danh sách cảnh); null nếu từ không có trong cảnh nào. */
export function findExploreScene(term: string): { id: string; title: string } | null {
  const scene = Object.values(SCENES).find((s) => s.objects.some((o) => o.term === term));
  return scene ? { id: scene.id, title: scene.title } : null;
}
