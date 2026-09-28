import type { Metadata } from "next";
import { TranslationSuggestionsAdminScreen } from "@/components/admin/translation-suggestions-admin-screen";

export const metadata: Metadata = { title: "Duyệt bản dịch", robots: { index: false } };

export default function AdminTranslationsPage() {
  return <TranslationSuggestionsAdminScreen />;
}
