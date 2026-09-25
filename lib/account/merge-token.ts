import { createHash, randomBytes } from "node:crypto";

export const MERGE_TOKEN_TTL_MS = 30 * 60_000;

/** Mã ngẫu nhiên 256 bit (base64url) gửi cho client; DB chỉ lưu băm của nó. */
export const generateMergeToken = () => randomBytes(32).toString("base64url");

export const hashMergeToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const isMergeTokenFormat = (token: unknown): token is string => typeof token === "string" && /^[A-Za-z0-9_-]{43}$/.test(token);

export const mergeTokenExpiry = (now: Date) => new Date(now.getTime() + MERGE_TOKEN_TTL_MS);
