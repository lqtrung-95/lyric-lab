"use client";

import dynamic from "next/dynamic";

/** Tải lười game 3D, không render phía máy chủ (three.js cần trình duyệt), để các trang khác không phải gánh gói 3D. */
const KitchenGame = dynamic(() => import("./kitchen-game").then((m) => m.KitchenGame), {
  ssr: false,
  loading: () => <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang dựng quán…</p>,
});

export function KitchenLoader() { return <KitchenGame />; }
