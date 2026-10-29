import { loadScene } from "@/lib/explore/load-scene";
import { SCENES } from "@/lib/explore/scenes";
import { pickAdventureScene, pickSouvenirWords } from "@/lib/pet/pet-adventure";

export const runtime = "nodejs";

const SEED = /^\d{4}-\d{2}-\d{2}:[^:]{1,40}$/;

/**
 * GET /api/pet/adventure?seed=YYYY-MM-DD:tên → {sceneId, title, words} một chuyến phiêu lưu của pet: cảnh và vài từ cố định theo hạt giống.
 * Từ lấy từ cảnh Khám phá (nghĩa Việt do ta viết, pinyin/Hán Việt/cấp HSK tra từ điển, quy tắc 2). Công khai, không phụ thuộc người dùng nên cache CDN.
 */
export async function GET(request: Request) {
  const seed = new URL(request.url).searchParams.get("seed") ?? "";
  if (!SEED.test(seed)) return Response.json({ error: "bad_seed" }, { status: 400 });
  const sceneId = pickAdventureScene(Object.keys(SCENES), seed);
  const scene = sceneId ? await loadScene(sceneId).catch(() => null) : null;
  const words = scene ? pickSouvenirWords(scene.objects, seed) : [];
  if (!scene || words.length === 0) return Response.json({ error: "no_scene" }, { status: 502, headers: { "Cache-Control": "no-store" } });
  return Response.json({ sceneId: scene.id, title: scene.title, words }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
