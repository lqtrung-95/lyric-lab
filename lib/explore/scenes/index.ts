import type { SceneDef } from "../explore-types";
import { BANK_SCENE } from "./bank-scene";
import { BAKERY_SCENE } from "./bakery-scene";
import { BEACH_SCENE } from "./beach-scene";
import { AIRPORT_SCENE } from "./airport-scene";
import { EATERY_SCENE } from "./restaurant-scene";
import { CINEMA_SCENE } from "./cinema-scene";
import { GYM_SCENE } from "./gym-scene";
import { HOSPITAL_SCENE } from "./hospital-scene";
import { HOTEL_SCENE } from "./hotel-scene";
import { KITCHEN_SCENE } from "./kitchen-scene";
import { LIBRARY_SCENE } from "./library-scene";
import { MARKET_SCENE } from "./market-scene";
import { MUSEUM_SCENE } from "./museum-scene";
import { OFFICE_SCENE } from "./office-scene";
import { PARK_SCENE } from "./park-scene";
import { ROOM_SCENE } from "./room-scene";
import { SALON_SCENE } from "./salon-scene";
import { SCHOOL_SCENE } from "./school-scene";
import { SHOP_SCENE } from "./shop-scene";
import { SCENE_CONVERSATIONS } from "./scene-conversations";
import { STATION_SCENE } from "./station-scene";
import { STADIUM_SCENE } from "./stadium-scene";
import { SUPERMARKET_SCENE } from "./supermarket-scene";

/** Các cảnh của Khám phá, theo thứ tự hiện ở danh sách. Cảnh nối thành một đường: Phòng, Quán ăn, Chợ, Nhà ga, Công viên, Bệnh viện, Trường học, Cửa hàng, Khách sạn, Sân bay, Văn phòng, Thư viện, Siêu thị, Bãi biển, Sân vận động, Tiệm bánh, Nhà bếp, Bảo tàng, Ngân hàng, Rạp phim, Phòng gym, Hiệu cắt tóc (đi qua lại bằng `exits`). */
export const SCENES: Record<string, SceneDef> = Object.fromEntries([ROOM_SCENE, EATERY_SCENE, MARKET_SCENE, STATION_SCENE, PARK_SCENE, HOSPITAL_SCENE, SCHOOL_SCENE, SHOP_SCENE, HOTEL_SCENE, AIRPORT_SCENE, OFFICE_SCENE, LIBRARY_SCENE, SUPERMARKET_SCENE, BEACH_SCENE, STADIUM_SCENE, BAKERY_SCENE, KITCHEN_SCENE, MUSEUM_SCENE, BANK_SCENE, CINEMA_SCENE, GYM_SCENE, SALON_SCENE].map((s) => [s.id, { ...s, conversation: SCENE_CONVERSATIONS[s.id] }]));
