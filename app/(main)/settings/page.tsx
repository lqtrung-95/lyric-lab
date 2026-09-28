import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Icon } from "@/components/ui/icon";
import { AccountSection } from "@/components/settings/account-section";
import { DeleteDataSection } from "@/components/settings/delete-data-section";
import { VoiceSection } from "@/components/settings/voice-section";
import { LearningSection } from "@/components/settings/learning-section";

export const metadata: Metadata = { title: "Cài đặt", robots: { index: false } };

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-space-md">
      <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Cài đặt</h1>
      <LearningSection />
      <VoiceSection />
      <Suspense>
        <AccountSection />
      </Suspense>
      <Link
        href="/feedback"
        className="flex items-center justify-between gap-3 rounded-2xl bg-surface-container-lowest p-space-md text-body-md text-on-surface shadow-sm hover:bg-surface-container-low"
      >
        <span>Góp ý &amp; báo lỗi cho Lyric Lab</span>
        <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
      </Link>
      <DeleteDataSection />
    </div>
  );
}
