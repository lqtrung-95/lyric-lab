// Tiến độ Hán tự mỗi ngày, lưu cục bộ theo thiết bị (localStorage): các lượt đoán của hôm nay và thống kê/chuỗi thắng. Không gửi lên máy chủ.

export interface DailyBlob {
  today: { key: string; guesses: string[] } | null;
  stats: { played: number; wins: number; streak: number; lastWin: string | null };
}
type StoreLike = Pick<Storage, "getItem" | "setItem">;

const STORE_KEY = "songhanzi-daily-v1";
export const DAILY_EVENT = "songhanzi:daily-change";
export const EMPTY_DAILY: DailyBlob = { today: null, stats: { played: 0, wins: 0, streak: 0, lastWin: null } };

const browserStore = (): StoreLike | null => { try { return typeof localStorage === "undefined" ? null : localStorage; } catch { return null; } };

/** Chuỗi thô trong kho (so sánh theo giá trị cho useSyncExternalStore). */
export const readDailyRaw = (store: StoreLike | null = browserStore()): string => { try { return store?.getItem(STORE_KEY) ?? ""; } catch { return ""; } };

export function parseDaily(raw: string): DailyBlob {
  try {
    const d = JSON.parse(raw) as Partial<DailyBlob>;
    const t = d.today, s = d.stats;
    return {
      today: t && typeof t.key === "string" && Array.isArray(t.guesses) ? { key: t.key, guesses: t.guesses.filter((g): g is string => typeof g === "string") } : null,
      stats: s && [s.played, s.wins, s.streak].every((n) => Number.isInteger(n)) ? { played: s.played!, wins: s.wins!, streak: s.streak!, lastWin: typeof s.lastWin === "string" ? s.lastWin : null } : EMPTY_DAILY.stats,
    };
  } catch { return EMPTY_DAILY; }
}

export function writeDaily(blob: DailyBlob, store: StoreLike | null = browserStore()): void {
  try { store?.setItem(STORE_KEY, JSON.stringify(blob)); } catch { /* hết chỗ hoặc bị chặn: chỉ mất phần lưu */ }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(DAILY_EVENT));
}

export function subscribeDaily(onChange: () => void): () => void {
  window.addEventListener(DAILY_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => { window.removeEventListener(DAILY_EVENT, onChange); window.removeEventListener("storage", onChange); };
}

/** Các lượt đoán của ngày `key`; sang ngày mới thì bắt đầu lại từ rỗng. */
export const guessesFor = (blob: DailyBlob, key: string): string[] => (blob.today?.key === key ? blob.today.guesses : []);

export const withGuess = (blob: DailyBlob, key: string, guess: string): DailyBlob => ({ ...blob, today: { key, guesses: [...guessesFor(blob, key), guess] } });

const previousDay = (key: string): string => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10);
};

/** Chốt ngày: thắng thì chuỗi +1 nếu hôm qua cũng thắng (không thì về 1); thua thì chuỗi về 0. */
export function withResult(blob: DailyBlob, key: string, won: boolean): DailyBlob {
  const { played, wins, streak, lastWin } = blob.stats;
  return { ...blob, stats: { played: played + 1, wins: wins + (won ? 1 : 0), streak: won ? (lastWin === previousDay(key) ? streak + 1 : 1) : 0, lastWin: won ? key : lastWin } };
}
