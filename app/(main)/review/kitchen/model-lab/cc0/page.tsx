import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { ModelGridLoader } from "@/components/kitchen/model-grid-loader";

export const metadata: Metadata = { title: "Thử gói mô hình CC0", robots: { index: false } };

// Chỉ để chấm chọn: các file nằm ở public/_trial (đã đưa vào .gitignore), lấy từ Kenney Food Kit (CC0).
const NAMES = ["bowl-broth", "bowl-soup", "chinese", "chopstick", "dim-sum", "steamer", "soy", "rice-ball", "cup-coffee", "cup-tea", "loaf-baguette", "sandwich", "sub", "egg-cooked", "pan", "pot-stew", "frying-pan", "cutting-board", "pancakes", "mug", "plate-deep", "cooking-spatula", "bread", "croissant"];

export default function Cc0TrialPage() {
  return (
    <ArcadeShell title="Thử gói mô hình CC0" intro="Kenney Food Kit (CC0) dưới ánh sáng của quán. Công cụ nội bộ để chọn tài nguyên." wide>
      <ModelGridLoader urls={NAMES.map((n) => `/_trial/${n}.glb`)} />
    </ArcadeShell>
  );
}
