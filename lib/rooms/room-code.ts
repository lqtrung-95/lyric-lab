import { randomInt } from "node:crypto";

export { buildRoomLink, normalizeRoomCode } from "./room-code-format";

/** Mã phòng 6 chữ số từ 100000 đến 999999 (không bắt đầu bằng 0 để dán/đọc không bị mất số 0). */
export const generateRoomCode = (random: (min: number, max: number) => number = randomInt): string => String(random(100000, 1000000));
