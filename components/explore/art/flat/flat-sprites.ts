import { CHARACTER_SPRITES } from "./flat-characters";
import { FOOD_SPRITES } from "./flat-food";
import { FURNITURE_SPRITES } from "./flat-furniture";
import type { FlatSprite } from "./flat-kit";
import { PROP_SPRITES } from "./flat-props";
import { SMALL_SPRITES } from "./flat-small";

/** Tất cả sprite Tranh C theo `id` của vật trong cảnh (kèm `guide` cho nhân vật dẫn đường). */
export const FLAT_SPRITES: Record<string, FlatSprite> = { ...FURNITURE_SPRITES, ...SMALL_SPRITES, ...FOOD_SPRITES, ...PROP_SPRITES, ...CHARACTER_SPRITES };
