import type { SceneDef } from "../explore-types";
import { AIRPORT_SCENE } from "./airport-scene";
import { EATERY_SCENE } from "./eatery-scene";
import { HOSPITAL_SCENE } from "./hospital-scene";
import { HOTEL_SCENE } from "./hotel-scene";
import { MARKET_SCENE } from "./market-scene";
import { PARK_SCENE } from "./park-scene";
import { ROOM_SCENE } from "./room-scene";
import { SCHOOL_SCENE } from "./school-scene";
import { SHOP_SCENE } from "./shop-scene";
import { STATION_SCENE } from "./station-scene";

/** Các cảnh của Khám phá, theo thứ tự hiện ở danh sách. Cảnh nối thành một đường: Phòng, Quán ăn, Chợ, Nhà ga, Công viên, Bệnh viện, Trường học, Cửa hàng, Khách sạn, Sân bay (đi qua lại bằng `exits`). */
export const SCENES: Record<string, SceneDef> = Object.fromEntries([ROOM_SCENE, EATERY_SCENE, MARKET_SCENE, STATION_SCENE, PARK_SCENE, HOSPITAL_SCENE, SCHOOL_SCENE, SHOP_SCENE, HOTEL_SCENE, AIRPORT_SCENE].map((s) => [s.id, s]));
