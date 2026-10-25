"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export interface MapEntry {
  id: string;
  title: string;
  /** Đang ở cảnh này. */
  here: boolean;
  /** Mục tiêu hiện tại ở cảnh này. */
  target: boolean;
  /** Cảnh có trong vụ án này (không thuộc vụ án thì mờ đi). */
  available: boolean;
  /** Chưa mở: cần làm xong các việc trước. */
  locked: boolean;
}

/** Bản đồ vụ án: danh sách các địa điểm, đi thẳng tới từng nơi (không phải đi bộ qua các cảnh), cảnh của mục tiêu hiện tại được đánh dấu. */
export function MapPanel({ entries, basePath, onClose }: { entries: MapEntry[]; basePath: string; onClose: () => void }) {
  return (
    <section aria-label="Bản đồ" className="card-ink p-space-md">
      <h2 className="text-headline-md">Bản đồ</h2>
      <ul className="mt-space-sm grid gap-2 sm:grid-cols-2">
        {entries.filter((e) => e.available).map((e) => (
          <li key={e.id}>
            {e.locked ? (
              <p className="flex min-h-11 items-center gap-2 rounded-xl border-2 border-dashed border-ink px-space-sm text-label-md font-extrabold text-on-surface-variant"><Icon name="block" size={18} />{e.title} (chưa mở, làm theo mục tiêu trước)</p>
            ) : e.here ? (
              <p className="flex min-h-11 items-center gap-2 rounded-xl bg-surface-container-high px-space-sm text-label-md font-extrabold"><Icon name="check_circle" size={18} filled />{e.title} (đang ở đây)</p>
            ) : (
              <Link href={`${basePath}/${e.id}`} className={`flex min-h-11 items-center justify-between gap-2 rounded-xl border-2 border-ink px-space-sm text-label-md font-extrabold hover:bg-surface-container-low ${e.target ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest"}`}>
                <span>{e.title}</span>{e.target && <span className="text-label-sm">Mục tiêu</span>}
              </Link>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onClose} className="mt-space-sm min-h-11 text-label-md font-extrabold text-primary hover:underline">Đóng</button>
    </section>
  );
}
