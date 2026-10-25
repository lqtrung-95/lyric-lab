import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryIntro } from "@/components/explore/story/story-intro";
import { CASES } from "@/lib/explore/story/cases";

export const metadata: Metadata = { title: "Phá án", robots: { index: false } };

export default async function StoryIntroPage({ params }: { params: Promise<{ case: string }> }) {
  const { case: caseId } = await params;
  const story = /^[a-z0-9-]{1,40}$/.test(caseId) ? CASES[caseId] : undefined;
  if (!story) notFound();
  return <StoryIntro story={{ title: story.title, difficulty: story.difficulty, intro: story.intro, objectives: story.objectives, startScene: story.startScene, solvedFlag: story.solvedFlag }} basePath={`/explore/cases/${caseId}`} />;
}
