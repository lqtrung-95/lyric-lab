import type { SceneDef } from "../explore-types";
import { EATERY_SCENE } from "./eatery-scene";
import { ROOM_SCENE } from "./room-scene";

/** Các cảnh của Khám phá, theo thứ tự hiện ở danh sách. Cảnh đi qua lại với nhau bằng `exits`. */
export const SCENES: Record<string, SceneDef> = { [ROOM_SCENE.id]: ROOM_SCENE, [EATERY_SCENE.id]: EATERY_SCENE };
