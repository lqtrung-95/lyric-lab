import type { Metadata } from "next";
import { FeedbackPageScreen } from "@/components/feedback/feedback-page-screen";

export const metadata: Metadata = { title: "Góp ý", robots: { index: false } };

export default function FeedbackPage() {
  return <FeedbackPageScreen />;
}
