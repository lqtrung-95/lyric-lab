import type { Metadata } from "next";
import { Suspense } from "react";
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
      <DeleteDataSection />
    </div>
  );
}
