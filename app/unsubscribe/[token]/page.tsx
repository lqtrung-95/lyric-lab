import type { Metadata } from "next";
import { UnsubscribeForm } from "@/components/email/unsubscribe-form";

export const metadata: Metadata = { title: "Hủy nhận email", robots: { index: false, follow: false } };

export default async function UnsubscribePage({ params }: { params: Promise<{ token: string }> }) {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-space-md px-gutter text-center">
      <h1 className="font-serif text-headline-lg-mobile">Hủy nhận email</h1>
      <UnsubscribeForm token={(await params).token} />
    </main>
  );
}
