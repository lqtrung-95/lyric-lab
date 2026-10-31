import type { Metadata } from "next";
import { WeekReportView } from "@/components/report/week-report-view";

export const metadata: Metadata = { title: "Báo cáo tuần", robots: { index: false } };

export default function ReportPage() {
  return <WeekReportView />;
}
