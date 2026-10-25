import { CHARACTER_SPRITES } from "./flat-characters";
import { FURNITURE_SPRITES } from "./flat-furniture";
import type { FlatSprite } from "./flat-kit";
import { SMALL_SPRITES } from "./flat-small";

/** Tất cả sprite Tranh C theo `id` của vật trong cảnh (kèm `guide` cho nhân vật dẫn đường). */
export const FLAT_SPRITES: Record<string, FlatSprite> = { ...FURNITURE_SPRITES, ...SMALL_SPRITES, ...CHARACTER_SPRITES };
