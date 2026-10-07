import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChallengeScreen } from "@/components/challenge/challenge-screen";
import { normalizeChallengeCode } from "@/lib/challenges/challenge-code";

export const metadata: Metadata = { title: "Thử thách", robots: { index: false } };

export default async function ChallengePage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeChallengeCode((await params).code);
  if (!code) notFound();
  return <ChallengeScreen code={code} />;
}
