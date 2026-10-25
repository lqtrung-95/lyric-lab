import type { SceneDef } from "../explore-types";
import { EATERY_SCENE } from "./eatery-scene";
import { HOSPITAL_SCENE } from "./hospital-scene";
import { MARKET_SCENE } from "./market-scene";
import { PARK_SCENE } from "./park-scene";
import { ROOM_SCENE } from "./room-scene";
import { STATION_SCENE } from "./station-scene";

/** Các cảnh của Khám phá, theo thứ tự hiện ở danh sách. Cảnh nối thành một đường: Phòng, Quán ăn, Chợ, Nhà ga, Công viên, Bệnh viện (đi qua lại bằng `exits`). */
export const SCENES: Record<string, SceneDef> = Object.fromEntries([ROOM_SCENE, EATERY_SCENE, MARKET_SCENE, STATION_SCENE, PARK_SCENE, HOSPITAL_SCENE].map((s) => [s.id, s]));
