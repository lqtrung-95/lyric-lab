import type { Metadata } from "next";
import { ModeTabs } from "@/components/review/mode-tabs";
import { ReviewScreen } from "@/components/review/review-screen";

export const metadata: Metadata = { title: "Ôn tập", robots: { index: false } };

export default function ReviewPage() {
  return (
    <>
      <ModeTabs />
      <ReviewScreen />
    </>
  );
}
