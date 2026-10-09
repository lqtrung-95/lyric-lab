"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

const GROUPS: { title: string; rows: [string, string][] }[] = [
  { title: "Phát", rows: [["Phát / Tạm dừng", "Space"], ["Câu trước", "←"], ["Câu sau", "→"], ["Nghe lại câu hiện tại", "R"], ["Lặp câu (bật/tắt)", "L"]] },
  { title: "Hiển thị", rows: [["Bật / tắt pinyin", "M"], ["Bật / tắt bản dịch", "T"]] },
];

/** Nút "Phím tắt" (chỉ hiện khi có bàn phím, từ md trở lên) mở hộp thoại liệt kê phím tắt của màn Nghe/Xem video. */
export function ShortcutsHelpButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Phím tắt" title="Phím tắt"
        className="hidden min-h-11 min-w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container md:inline-flex">
        <Icon name="keyboard" size={18} />
      </button>
      <dialog ref={ref} aria-labelledby="shortcuts-title" onClose={() => setOpen(false)} onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
        className="m-auto w-[min(92vw,24rem)] rounded-3xl bg-surface-container-lowest p-0 text-on-surface shadow-[0_24px_60px_-20px_rgba(20,10,5,0.5)] backdrop:bg-black/50 backdrop:backdrop-blur-[2px]">
        <div className="p-space-lg">
          <h2 id="shortcuts-title" className="flex items-center gap-2 font-serif text-headline-md"><Icon name="keyboard" size={22} />Phím tắt</h2>
          {GROUPS.map((g) => (
            <section key={g.title} className="mt-space-md">
              <h3 className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">{g.title}</h3>
              <ul className="mt-2 divide-y divide-outline-variant rounded-xl border border-outline-variant">
                {g.rows.map(([label, key]) => (
                  <li key={label} className="flex items-center justify-between px-3 py-2 text-body-md">
                    {label}<kbd className="min-w-8 rounded-md border border-outline bg-surface-container px-2 py-0.5 text-center text-label-md font-semibold">{key}</kbd>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="mt-space-md rounded-xl bg-surface-container p-3 text-label-md text-on-surface-variant">Phím tắt tạm ngưng khi con trỏ đang trong ô nhập liệu.</p>
          <button type="button" autoFocus onClick={() => setOpen(false)} className="mt-space-md min-h-11 w-full rounded-full bg-primary text-label-md font-semibold text-on-primary">Đã hiểu</button>
        </div>
      </dialog>
    </>
  );
}
