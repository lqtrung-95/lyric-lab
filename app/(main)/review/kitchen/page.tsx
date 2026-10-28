import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { KitchenLoader } from "@/components/kitchen/kitchen-loader";

export const metadata: Metadata = { title: "Quán ăn 3D", robots: { index: false } };

/** Bản thử quán ăn 3D (giai đoạn 0): chưa nằm trong menu, vào bằng đường dẫn trực tiếp. */
export default function KitchenPage() {
  return (
    <ArcadeShell title="Quán ăn 3D (bản thử)" intro="Khách gọi món bằng tiếng Trung, bạn nấu và mang ra. Bản thử để kiểm tra 3D có chạy mượt không." wide>
      <KitchenLoader />
    </ArcadeShell>
  );
}
