import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountSection } from "@/components/settings/account-section";
import { AdminEntry } from "@/components/settings/admin-entry";
import { DeleteDataSection } from "@/components/settings/delete-data-section";
import { LearningRows } from "@/components/settings/learning-rows";
import { ListenRows } from "@/components/settings/listen-rows";
import { NicknameSection } from "@/components/settings/nickname-section";
import { EmailRows } from "@/components/email/email-rows";
import { ReminderRow } from "@/components/reminders/reminder-row";
import { QuickStartCard } from "@/components/settings/quick-start-card";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsTabs, type SettingsTab } from "@/components/settings/settings-tabs";
import { VoiceRows } from "@/components/settings/voice-rows";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default function SettingsPage() {
  // Chia bốn tab để trang không dài: Tài khoản (đăng nhập, biệt danh, quản trị, xóa dữ liệu), Học tập (level, thẻ, cỡ video, giọng đọc),
  // Thông báo (nhắc học, email) và Mẹo. Tài khoản đứng đầu vì với người chưa đăng nhập đó là chỗ giữ dữ liệu khỏi mất.
  // Các dòng thông báo tự ẩn khi thiết bị hoặc server không hỗ trợ; dòng chú thích `only:block` chỉ hiện khi không còn dòng nào.
  const tabs: SettingsTab[] = [
    {
      id: "account", label: "Tài khoản",
      content: (
        <>
          {/* Khung chờ cùng dạng thẻ để trang không nhảy khi mục Tài khoản tải xong. */}
          <Suspense fallback={<div aria-hidden="true" className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm"><Skeleton className="h-7 w-32" /><Skeleton className="mt-space-sm h-16 w-full" /></div>}>
            <AccountSection />
          </Suspense>
          <NicknameSection />
          <AdminEntry />
          <DeleteDataSection />
        </>
      ),
    },
    {
      id: "learning", label: "Học tập",
      content: (
        <SettingsCard id="prefs-heading" title="Học và nghe">
          <LearningRows />
          <ListenRows />
          <VoiceRows />
        </SettingsCard>
      ),
    },
    {
      id: "notifications", label: "Thông báo",
      content: (
        <SettingsCard id="notifications-heading" title="Nhắc học và email">
          <ReminderRow />
          <EmailRows />
          <p className="hidden py-space-sm text-body-md text-on-surface-variant only:block">Thiết bị này chưa hỗ trợ thông báo. Đăng nhập Google để nhận email tổng kết tuần và nhắc học.</p>
        </SettingsCard>
      ),
    },
    { id: "tips", label: "Mẹo", content: <QuickStartCard /> },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Cài đặt</h1>
      <Suspense fallback={<Skeleton className="h-11 w-full" />}>
        <SettingsTabs tabs={tabs} />
      </Suspense>
    </div>
  );
}
