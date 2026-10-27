"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { foldVietnamese } from "@/lib/tra-tu/fold-vietnamese";
import { ToolsHowTo } from "./tools-howto";
import { TOOL_CATEGORIES, type ToolCategory, type ToolEntry } from "@/lib/tools/tool-registry";

const chip = (on: boolean) => `min-h-11 rounded-full border-2 px-4 text-label-md font-semibold transition-colors ${on ? "border-primary bg-primary text-on-primary" : "border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"}`;

function ToolCard({ t }: { t: ToolEntry }) {
  return (
    <Link href={t.href} className="flex h-full min-h-28 flex-col gap-2 card-ink p-space-md transition-colors hover:bg-surface-container-high">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high text-primary"><Icon name={t.icon} size={22} /></span>
      <span className="text-body-lg font-semibold text-on-surface">{t.title}</span>
      <span className="text-label-md text-on-surface-variant">{t.description}</span>
    </Link>
  );
}

/**
 * Mục lục công cụ: ô tìm (không dấu cũng khớp), lọc theo nhóm, hàng "Dùng nhiều nhất" khi chưa lọc/tìm, rồi các công cụ còn lại.
 * Nội dung vẫn được dựng sẵn trên máy chủ (liên kết nội bộ cho công cụ tìm kiếm); lọc chỉ chạy ở trình duyệt.
 */
export function ToolsHub({ tools }: { tools: readonly ToolEntry[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ToolCategory | "all">("all");
  const folded = foldVietnamese(query);
  const filtered = useMemo(() => tools.filter((t) => {
    if (category !== "all" && t.category !== category) return false;
    if (!folded) return true;
    return foldVietnamese([t.title, t.description, ...(t.keywords ?? [])].join(" ")).includes(folded);
  }), [tools, category, folded]);
  const filtering = category !== "all" || folded !== "";
  const popular = tools.filter((t) => t.popular);
  const rest = filtering ? filtered : tools.filter((t) => !t.popular);
  return (
    <div className="space-y-space-lg">
      <div className="space-y-3 print:hidden">
        <label htmlFor="tool-search" className="sr-only">Tìm công cụ</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"><Icon name="search" size={20} /></span>
          <input
            id="tool-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Tìm trong ${tools.length} công cụ miễn phí…`}
            className="min-h-12 w-full rounded-full border border-outline-variant bg-surface-container-lowest pl-12 pr-4 text-body-lg text-on-surface focus:border-primary focus:outline-none"
          />
        </div>
        <div role="group" aria-label="Lọc theo nhóm" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={category === "all"} onClick={() => setCategory("all")} className={chip(category === "all")}>Tất cả</button>
          {TOOL_CATEGORIES.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setCategory(c.id)} className={chip(category === c.id)}>{c.label}</button>
          ))}
        </div>
      </div>
      {!filtering && popular.length > 0 && (
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="font-serif text-headline-md">Dùng nhiều nhất</h2>
          <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">{popular.map((t) => <li key={t.href}><ToolCard t={t} /></li>)}</ul>
        </section>
      )}
      <section aria-labelledby="all-heading">
        <h2 id="all-heading" className="font-serif text-headline-md">{filtering ? `Kết quả (${filtered.length})` : "Các công cụ khác"}</h2>
        {rest.length === 0 ? (
          <p role="status" className="mt-space-sm text-body-md text-on-surface-variant">Chưa có công cụ nào khớp. Thử từ khóa khác hoặc chọn &quot;Tất cả&quot;.</p>
        ) : (
          <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">{rest.map((t) => <li key={t.href}><ToolCard t={t} /></li>)}</ul>
        )}
      </section>
      {!filtering && <ToolsHowTo tools={tools} />}
    </div>
  );
}
