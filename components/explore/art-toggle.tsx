"use client";

import type { ArtStyle } from "./art/scene-art";

const OPTIONS: { value: ArtStyle; label: string }[] = [
  { value: "ai", label: "Tranh A · AI vẽ" },
  { value: "pixel", label: "Tranh B · Pixel (code)" },
];

/** Chuyển giữa hai bộ tranh để so sánh trên cùng một bố cục. */
export function ArtToggle({ value, onChange }: { value: ArtStyle; onChange: (v: ArtStyle) => void }) {
  return (
    <div role="radiogroup" aria-label="Bộ tranh" className="inline-flex rounded-full border-2 border-ink bg-surface-container-low p-0.5">
      {OPTIONS.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className={`min-h-11 rounded-full px-3 text-label-md font-extrabold ${value === o.value ? "bg-primary-container text-on-primary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
