import type { Metadata } from "next";
import { FeedbackAdminScreen } from "@/components/admin/feedback-admin-screen";

export const metadata: Metadata = { title: "Duyệt góp ý", robots: { index: false } };

export default function AdminFeedbackPage() {
  return <FeedbackAdminScreen />;
}
