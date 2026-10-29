import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { RadicalForgeGame } from "@/components/games/radical-forge-game";
import { loadRadicalRecipes } from "@/lib/games/load-radical-recipes";

export const metadata: Metadata = { title: "Ghép bộ thủ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await loadRadicalRecipes().catch(() => ({ start: [], recipes: [], info: {} }));
  return (
    <ArcadeShell title="Ghép bộ thủ" intro="Bắt đầu với vài bộ thủ cơ bản, ghép hai mảnh thành chữ mới (日 + 月 = 明), rồi lấy chữ mới ghép tiếp. Mỗi chữ tìm được có nghĩa, Hán Việt và nút thêm vào bộ ôn.">
      <RadicalForgeGame data={data} />
    </ArcadeShell>
  );
}
