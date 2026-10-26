import type { Metadata } from "next";
import { CoopLobby } from "@/components/explore/coop-lobby";
import { CASES } from "@/lib/explore/story/cases";

export const metadata: Metadata = { title: "Phá án cùng bạn", robots: { index: false } };

/** Phá án cùng bạn: tạo phòng cho một vụ án rồi gửi liên kết, hoặc dán liên kết bạn gửi để vào. */
export default function CoopLobbyPage() {
  const cases = Object.values(CASES).map((c) => ({ id: c.id, title: c.title, difficulty: c.difficulty, blurb: c.blurb, startScene: c.startScene }));
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <header>
        <h1 className="text-headline-lg">Phá án cùng bạn</h1>
        <p className="text-body-md text-on-surface-variant">Hai người cùng một vụ án: mỗi người phụ trách một nửa số cảnh, manh mối ai tìm thấy đều vào sổ của cả hai. Nói chuyện bằng các câu tiếng Trung có sẵn để ghép lại sự thật.</p>
      </header>
      <CoopLobby cases={cases} />
    </div>
  );
}
