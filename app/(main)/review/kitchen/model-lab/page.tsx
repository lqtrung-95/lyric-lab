import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { ModelLabLoader } from "@/components/kitchen/model-lab-loader";

export const metadata: Metadata = { title: "Phòng thử mô hình 3D", robots: { index: false } };

/** Công cụ nội bộ: xem thử file .glb (ví dụ mô hình tạo bằng AI) trước khi đưa vào game quán ăn. */
export default function ModelLabPage() {
  return (
    <ArcadeShell title="Phòng thử mô hình 3D" intro="Kéo thả file .glb để xem chất lượng và độ nặng (số tam giác, texture) trước khi đưa vào quán ăn." wide>
      <ModelLabLoader />
    </ArcadeShell>
  );
}
