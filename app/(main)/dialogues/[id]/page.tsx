import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DialoguePlayer } from "@/components/dialogues/dialogue-player";
import { loadDialogue } from "@/lib/dialogues/load-dialogues";
import { SCENES } from "@/lib/explore/scenes";

export const metadata: Metadata = { title: "Hội thoại", robots: { index: false } };

export default async function DialoguePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = /^[a-z0-9-]{1,60}$/.test(id) ? await loadDialogue(id) : null;
  if (!detail) notFound();
  const sceneTitle = detail.dialogue.sceneId ? SCENES[detail.dialogue.sceneId]?.title ?? null : null;
  return <DialoguePlayer key={detail.dialogue.id} dialogue={detail.dialogue} pinyin={detail.pinyin} level={detail.level} sceneTitle={sceneTitle} />;
}
