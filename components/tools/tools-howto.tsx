import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { TOOL_CATEGORIES, type ToolCategory, type ToolEntry } from "@/lib/tools/tool-registry";

/** Mỗi nhóm một tông màu riêng (nền nhạt và viền cùng họ) để mắt phân biệt nhanh các nhóm. */
const TONE: Record<ToolCategory, { card: string; icon: string }> = {
  writing: { card: "border-error/30 bg-error-container/25", icon: "bg-error-container text-on-error-container" },
  pronunciation: { card: "border-primary/30 bg-primary-container/25", icon: "bg-primary-container text-on-primary-container" },
  sentences: { card: "border-secondary/30 bg-secondary-container/25", icon: "bg-secondary-container text-on-secondary-container" },
  everyday: { card: "border-tertiary/30 bg-tertiary-container/25", icon: "bg-tertiary-container text-on-tertiary-container" },
  hsk: { card: "border-outline/40 bg-surface-container-high", icon: "bg-surface-container-highest text-on-surface" },
};

/** "Cách dùng các công cụ": mỗi nhóm một thẻ có biểu tượng, một câu giới thiệu và danh sách công cụ của nhóm kèm một dòng mô tả. */
export function ToolsHowTo({ tools }: { tools: readonly ToolEntry[] }) {
  return (
    <section aria-labelledby="howto-heading" className="space-y-space-sm">
      <h2 id="howto-heading" className="font-serif text-headline-md">Cách dùng các công cụ</h2>
      <div className="grid gap-gutter md:grid-cols-2 lg:grid-cols-3">
        {TOOL_CATEGORIES.map((c) => {
          const items = tools.filter((t) => t.category === c.id);
          if (items.length === 0) return null;
          return (
            <section key={c.id} aria-labelledby={`howto-${c.id}`} className={`rounded-3xl border-2 p-space-md ${TONE[c.id].card}`}>
              <header className="flex items-start gap-3">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${TONE[c.id].icon}`}><Icon name={c.icon} size={26} /></span>
                <div>
                  <h3 id={`howto-${c.id}`} className="text-body-lg font-bold text-on-surface">{c.heading}</h3>
                  <p className="text-label-md text-on-surface-variant">{c.blurb}</p>
                </div>
              </header>
              <ul className="mt-space-sm space-y-space-sm">
                {items.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="inline-flex min-h-11 items-center gap-1 text-body-md font-semibold text-on-surface underline decoration-2 underline-offset-4 hover:text-primary">{t.title}<Icon name="arrow_forward" size={16} /></Link>
                    <p className="text-label-md text-on-surface-variant">{t.description}</p>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
