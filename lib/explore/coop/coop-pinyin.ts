import table from "./coop-pinyin.generated.json";

const PINYIN = table as Record<string, string>;

/** Pinyin (từ từ điển, tạo sẵn bằng `scripts/generate-coop-pinyin.mts`) của một câu hoặc từ trong chế độ chơi chung; không có thì undefined. */
export const coopPinyin = (zh: string): string | undefined => PINYIN[zh];
