"use client";

import { useMemo, useState } from "react";
import { Button3d } from "@/components/ui/button-3d";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { NAME_MAX_CHARS, type NamePart } from "@/lib/names/chinese-name";
import { ImageShareDialog } from "@/components/share/image-share-dialog";
import { SITE_URL } from "@/lib/seo/site-url";
import { renderNameImage } from "./chinese-name-image";

interface Result { parts: (NamePart & { pinyin: string | null })[]; han: string | null; pinyin: string | null; summary: string | null; vietnamese: string }

const ROLE: Record<NamePart["role"], string> = { surname: "Họ", middle: "Đệm", given: "Tên" };

/** Nhập tên Việt, ra tên Hán gợi ý theo âm Hán Việt kèm pinyin và nghĩa từng chữ; lưu thẻ PNG hoặc chia sẻ. Gửi bằng POST (tên không nằm trong URL). */
export function ChineseNameTool() {
  const [name, setName] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "bad" | "error">("idle");
  const [note, setNote] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setState("busy"); setNote(null);
    try {
      const r = await fetch("/api/ten-tieng-trung", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name }) });
      if (r.status === 400) { setState("bad"); setRes(null); return; }
      if (!r.ok) throw new Error("bad_status");
      setRes({ ...(await r.json()), vietnamese: name.trim() });
      setState("idle");
    } catch { setState("error"); }
  };
  // Ảnh dựng từ kết quả hiện tại; `useMemo` để hộp thoại chỉ dựng lại khi đổi tên.
  const renderCard = useMemo(() => {
    if (!res?.han) return null;
    const r = res;
    return () => renderNameImage({ vietnamese: r.vietnamese, han: r.han!, pinyin: r.pinyin, summary: r.summary, lines: r.parts.filter((p) => p.han && p.meaning !== "họ").map((p) => `${p.han} ${p.syllable}: ${p.meaning}`) });
  }, [res]);
  const save = async () => {
    if (!renderCard) return;
    try {
      const blob = await renderCard();
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement("a"), { href: url, download: "ten-tieng-trung.png" }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote("Đã lưu ảnh vào máy.");
    } catch { setNote("Chưa tạo được ảnh. Thử lại nhé."); }
  };

  const missing = res?.parts.filter((p) => !p.han) ?? [];
  return (
    <div className="space-y-space-md">
      <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
        <label htmlFor="vn-name" className="sr-only">Tên của bạn</label>
        <input id="vn-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={NAME_MAX_CHARS} placeholder="Ví dụ: Nguyễn Minh Anh" autoComplete="off" className="min-h-12 min-w-[14rem] flex-1 rounded-xl border-2 border-ink bg-surface-container-lowest px-3 text-body-lg" />
        <Button3d type="submit" variant="bright" disabled={state === "busy" || !name.trim()}>{state === "busy" ? "Đang chuyển…" : "Đổi sang tiếng Trung"}</Button3d>
      </form>
      {state === "bad" && <p role="alert" className="text-body-md text-error">Hãy nhập tên Việt (tối đa {NAME_MAX_CHARS} ký tự, chỉ chữ cái).</p>}
      {state === "error" && <p role="alert" className="text-body-md text-error">Chưa chuyển được. Kiểm tra kết nối rồi thử lại nhé.</p>}
      {sharing && renderCard && res?.han && (
        <ImageShareDialog heading="Chia sẻ tên tiếng Trung" alt={`Thẻ tên tiếng Trung: ${res.han}`} render={renderCard} filename="ten-tieng-trung.png"
          text={`Tên tiếng Trung của mình là ${res.han}! Thử của bạn tại songhanzi.com/ten-tieng-trung`} shareUrl={`${SITE_URL}/ten-tieng-trung`} onClose={() => setSharing(false)} />
      )}
      {res && (
        <section aria-live="polite" className="rounded-3xl border-4 border-[#b3261e] bg-surface-container-lowest p-space-md text-center">
          {res.han ? (
            <>
              <p lang="zh" className="font-serif text-[clamp(3rem,16vw,6rem)] font-bold leading-tight text-[#b3261e]">{res.han}</p>
              {res.pinyin && <p className="text-headline-md font-bold">{res.pinyin}</p>}
              <div className="mt-1 flex justify-center"><PronounceButton text={res.han} /></div>
            </>
          ) : <p className="text-body-md">Có âm chưa có chữ gợi ý nên chưa ghép được cả tên: {missing.map((p) => p.syllable).join(", ")}.</p>}
          {res.han && res.summary && <p className="mx-auto mt-space-sm max-w-xl rounded-2xl bg-surface-container-low px-space-md py-space-sm text-body-lg italic">“{res.summary}”</p>}
          <ul className="mt-space-sm grid gap-2 text-left sm:grid-cols-2">
            {res.parts.map((p, i) => (
              <li key={i} className="rounded-xl bg-surface-container-low px-3 py-2">
                <span className="text-label-md font-bold text-on-surface-variant">{ROLE[p.role]} · {p.syllable}</span>
                <span className="block"><span lang="zh" className="font-serif text-hanzi-display">{p.han ?? "?"}</span> {p.pinyin && <span className="text-primary">{p.pinyin}</span>}</span>
                {p.meaning && p.meaning !== "họ" && <span className="text-body-md">{p.meaning}</span>}
              </li>
            ))}
          </ul>
          {res.han && (
            <div className="mt-space-sm flex flex-wrap justify-center gap-2">
              <Button3d type="button" variant="bright" onClick={() => void save()}>Lưu thẻ ảnh</Button3d>
              <Button3d type="button" onClick={() => setSharing(true)}>Chia sẻ</Button3d>
            </div>
          )}
          {note && <p role="status" className="mt-2 text-label-md font-bold">{note}</p>}
          <p className="mt-space-sm text-label-md text-on-surface-variant">Đây là gợi ý theo âm Hán Việt, mỗi âm có thể có nhiều chữ Hán khác. Tên chính thức nên hỏi thêm người bản ngữ.</p>
        </section>
      )}
    </div>
  );
}
