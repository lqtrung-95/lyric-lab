"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { isSingleHan } from "@/lib/tra-tu/han-char";
import { StrokeWriter } from "./stroke-writer";

/**
 * Khối "Nét viết": chọn từng chữ của từ rồi xem thứ tự nét / tập viết. Chỉ nạp thư viện và dữ liệu nét khi người dùng mở khối (tiết kiệm băng thông cho người chỉ tra nghĩa).
 */
export function StrokeSection({ term }: { term: string }) {
  const chars = [...new Set([...term].filter(isSingleHan))];
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  if (chars.length === 0) return null;
  return (
    <section aria-label="Nét viết" className="card-ink space-y-space-sm bg-surface-container-lowest p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-headline-sm font-extrabold">Nét viết</h2>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} className="btn-3d btn-3d-neutral min-h-11 px-4 text-label-md font-extrabold">
          <span className="inline-flex items-center gap-1"><Icon name={open ? "expand_less" : "brush"} size={20} /> {open ? "Thu gọn" : "Xem thứ tự nét, tập viết"}</span>
        </button>
      </div>
      {open && (
        <>
          {chars.length > 1 && (
            <div role="group" aria-label="Chọn chữ" className="flex flex-wrap gap-2">
              {chars.map((c, i) => (
                <button key={c} type="button" lang="zh-Hans" aria-pressed={i === active} onClick={() => setActive(i)}
                  className={`size-11 rounded-full border-2 border-ink font-serif text-xl font-bold ${i === active ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>{c}</button>
              ))}
            </div>
          )}
          <StrokeWriter key={chars[active]} char={chars[active]} />
          <p className="text-body-sm text-on-surface-variant">
            Dữ liệu nét: <a href="https://github.com/skishore/makemeahanzi" className="underline" rel="noreferrer">Make Me a Hanzi</a> qua gói hanzi-writer-data, theo{" "}
            <a href="/licenses/ARPHICPL.TXT" className="underline">Arphic Public License</a>. Thư viện vẽ: Hanzi Writer (MIT).
          </p>
        </>
      )}
    </section>
  );
}
