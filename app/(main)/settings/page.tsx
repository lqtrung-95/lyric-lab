import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountSection } from "@/components/settings/account-section";
import { AdminEntry } from "@/components/settings/admin-entry";
import { DeleteDataSection } from "@/components/settings/delete-data-section";
import { LearningRows } from "@/components/settings/learning-rows";
import { ListenRows } from "@/components/settings/listen-rows";
import { NicknameSection } from "@/components/settings/nickname-section";
import { ReminderRow } from "@/components/reminders/reminder-row";
import { QuickStartCard } from "@/components/settings/quick-start-card";
import { SettingsCard } from "@/components/settings/settings-card";
import { VoiceRows } from "@/components/settings/voice-rows";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default function SettingsPage() {
  // Một cột gọn: các tùy chọn nhỏ (học, nghe, giọng đọc) gom thành các dòng "nhãn + ô chọn" trong một thẻ thay vì mỗi tùy chọn một thẻ
  // cao, nên trang ngắn mà không cần chia cột (chia cột khó cân đối vì độ cao các thẻ rất khác nhau). Tài khoản đứng đầu vì với người
  // chưa đăng nhập đó là chỗ giữ dữ liệu khỏi mất; đã đăng nhập thì thẻ chỉ vài dòng. "Xóa dữ liệu" luôn cuối cùng.
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Cài đặt</h1>
      {/* Khung chờ cùng dạng thẻ để trang không nhảy khi mục Tài khoản tải xong. */}
      <Suspense fallback={<div aria-hidden="true" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm"><Skeleton className="h-7 w-32" /><Skeleton className="mt-space-sm h-16 w-full" /></div>}>
        <AccountSection />
      </Suspense>
      <NicknameSection />
      <SettingsCard id="prefs-heading" title="Học và nghe">
        <LearningRows />
        <ListenRows />
        <VoiceRows />
        <ReminderRow />
      </SettingsCard>
      <QuickStartCard />
      <AdminEntry />
      <DeleteDataSection />
    </div>
  );
}
