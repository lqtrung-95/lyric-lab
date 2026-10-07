import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { SongReportsAdminScreen } from "@/components/admin/song-reports-admin-screen";

export const metadata: Metadata = { title: "Báo cáo bài hát", robots: { index: false } };

export default function AdminReportsPage() {
  return (
    <AdminGate>
      <SongReportsAdminScreen />
    </AdminGate>
  );
}
