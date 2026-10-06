import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { VideosAdminScreen } from "@/components/admin/videos-admin-screen";

export const metadata: Metadata = { title: "Quản lý video", robots: { index: false } };

export default function AdminVideosPage() {
  return (
    <AdminGate>
      <VideosAdminScreen />
    </AdminGate>
  );
}
