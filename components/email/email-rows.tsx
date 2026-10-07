"use client";

import { useEffect, useState } from "react";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { SettingRow } from "@/components/settings/settings-card";

interface Prefs { weeklyEnabled: boolean; reminderEnabled: boolean }

/** Hai công tắc email trong Cài đặt (tổng kết tuần, nhắc quay lại). Ẩn khi tài khoản không có email thật hoặc server chưa bật email. */
export function EmailRows() {
  const [prefs, setPrefs] = useState<Prefs | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/email/prefs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { configured?: boolean } & Partial<Prefs> | null) => { if (!cancelled && d?.configured) setPrefs({ weeklyEnabled: d.weeklyEnabled!, reminderEnabled: d.reminderEnabled! }); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  if (!prefs) return null;
  async function change(patch: Partial<Prefs>) {
    setPrefs((p) => (p ? { ...p, ...patch } : p));
    const res = await fetch("/api/email/prefs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => null);
    if (!res?.ok) setPrefs((p) => (p ? { ...p, ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, !v])) } : p));
  }
  const toggle = (label: string, on: boolean, onClick: () => void) => <ToggleSwitch on={on} label={label} onChange={onClick} />;
  return (
    <>
      <SettingRow label="Email tổng kết tuần" hint="Mỗi sáng thứ Hai, chỉ khi tuần qua bạn có học.">{toggle("Email tổng kết tuần", prefs.weeklyEnabled, () => void change({ weeklyEnabled: !prefs.weeklyEnabled }))}</SettingRow>
      <SettingRow label="Email nhắc quay lại" hint="Khi bạn đã vài ngày chưa học. Tối đa một email mỗi tuần.">{toggle("Email nhắc quay lại", prefs.reminderEnabled, () => void change({ reminderEnabled: !prefs.reminderEnabled }))}</SettingRow>
    </>
  );
}
