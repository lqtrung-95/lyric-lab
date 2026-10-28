import type { Metadata } from "next";
import { ListenSwitch } from "@/components/layout/listen-switch";
import { DialogueBrowser } from "@/components/dialogues/dialogue-browser";
import { loadDialogueSummaries } from "@/lib/dialogues/load-dialogues";

export const metadata: Metadata = { title: "Hội thoại", robots: { index: false } };

/** Hội thoại hai người theo chủ đề và cấp HSK: nghe từng câu, xem pinyin và nghĩa Việt, đóng vai một bên để tập nói. */
export default async function DialoguesPage() {
  const dialogues = await loadDialogueSummaries();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-space-md">
      <ListenSwitch current="dialogues" />
      <header>
        <h1 className="text-headline-lg">Hội thoại</h1>
        <p className="text-body-md text-on-surface-variant">Nghe từng câu, xem pinyin và nghĩa Việt, rồi đóng vai một bên để tập nói.</p>
      </header>
      <DialogueBrowser dialogues={dialogues} />
    </div>
  );
}
