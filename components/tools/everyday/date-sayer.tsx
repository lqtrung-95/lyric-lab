"use client";

import { useState } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { formatChineseDate, MONTHS } from "@/lib/tools/everyday/months-dates";

/** Ngày hôm nay theo giờ máy (yyyy-mm-dd), dùng làm giá trị mặc định của ô chọn ngày. */
const todayValue = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** Chọn một ngày bất kỳ để nghe và xem cách nói bằng tiếng Trung (văn viết 日 và khẩu ngữ 号, kèm thứ), kèm bảng mười hai tháng. */
export function DateSayer() {
  const [value, setValue] = useState(todayValue);
  const [y, m, d] = value.split("-").map(Number);
  const date = y >= 1000 && m && d ? (() => { try { return formatChineseDate(y, m, d); } catch { return null; } })() : null;
  return (
    <div className="space-y-space-lg">
      <section aria-labelledby="say-date-heading" className="card-ink space-y-3 p-space-md">
        <h2 id="say-date-heading" className="font-serif text-headline-md">Nói một ngày bất kỳ</h2>
        <label htmlFor="date-input" className="block text-label-md font-medium text-on-surface">Chọn ngày</label>
        <input id="date-input" type="date" value={value} min="1000-01-01" max="9999-12-31" onChange={(e) => setValue(e.target.value)}
          className="min-h-12 rounded-full border border-outline-variant bg-surface-container-lowest px-5 text-body-lg text-on-surface focus:border-primary focus:outline-none" />
        {date ? (
          <div className="space-y-3" role="status">
            {[{ label: "Khẩu ngữ (号)", r: date.spoken }, { label: "Văn viết (日)", r: date.written }].map(({ label, r }) => (
              <div key={label} className="flex items-start gap-3 rounded-xl bg-surface-container p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-label-md text-on-surface-variant">{label}</p>
                  <p lang="zh" className="font-serif text-headline-md">{r.zh} {date.weekday.zh}</p>
                  <p className="text-body-md text-primary">{r.pinyin} {date.weekday.pinyin}</p>
                </div>
                <PronounceButton text={`${r.zh}${date.weekday.zh}`} className="size-10" />
              </div>
            ))}
            <p className="text-body-md text-on-surface-variant">{date.weekday.vi}. Năm đọc từng chữ số, tháng và ngày đọc như số đếm.</p>
          </div>
        ) : <p role="alert" className="text-label-md text-on-surface-variant">Chọn một ngày hợp lệ để xem cách nói.</p>}
      </section>
      <section aria-labelledby="months-heading">
        <h2 id="months-heading" className="font-serif text-headline-md">Mười hai tháng</h2>
        <ul className="mt-space-sm grid gap-gutter sm:grid-cols-2 lg:grid-cols-3">
          {MONTHS.map((mo) => (
            <li key={mo.zh} className="card-ink flex items-center gap-3 p-space-sm">
              <div className="min-w-0 flex-1">
                <p lang="zh" className="font-serif text-headline-md">{mo.zh}</p>
                <p className="text-body-md text-primary">{mo.pinyin}</p>
                <p className="text-body-md text-on-surface">{mo.vi}</p>
              </div>
              <PronounceButton text={mo.zh} className="size-10" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
