import type { Metadata } from "next";
import { AdminGate } from "@/components/admin/admin-gate";
import { TranslationSuggestionsAdminScreen } from "@/components/admin/translation-suggestions-admin-screen";

export const metadata: Metadata = { title: "Duyệt bản dịch", robots: { index: false } };

export default function AdminTranslationsPage() {
  return (
    <AdminGate>
      <TranslationSuggestionsAdminScreen />
    </AdminGate>
  );
}
