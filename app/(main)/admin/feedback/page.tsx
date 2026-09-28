import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { FeedbackAdminScreen } from "@/components/admin/feedback-admin-screen";

export const metadata: Metadata = { title: "Duyệt góp ý", robots: { index: false } };

export default function AdminFeedbackPage() {
  return (
    <AdminGate>
      <FeedbackAdminScreen />
    </AdminGate>
  );
}
