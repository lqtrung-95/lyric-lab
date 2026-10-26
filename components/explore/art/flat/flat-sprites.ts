import { AIRPORT_SPRITES } from "./flat-airport";
import { ANIMAL_SPRITES } from "./flat-animals";
import { CHARACTER_SPRITES } from "./flat-characters";
import { FOOD_SPRITES } from "./flat-food";
import { FURNITURE_SPRITES } from "./flat-furniture";
import type { FlatSprite } from "./flat-kit";
import { HOSPITAL_SPRITES } from "./flat-hospital";
import { HOTEL_SPRITES } from "./flat-hotel";
import { MARKET_SPRITES } from "./flat-market";
import { PARK_SPRITES } from "./flat-park";
import { PLACE_SPRITES } from "./flat-places";
import { PROP_SPRITES } from "./flat-props";
import { SCHOOL_SPRITES } from "./flat-school";
import { SHOP_SPRITES } from "./flat-shop";
import { STATION_SPRITES } from "./flat-station";
import { STORY_SPRITES } from "./flat-story";
import { SMALL_SPRITES } from "./flat-small";

/** Tất cả sprite Tranh C theo `id` của vật trong cảnh (kèm `guide` cho nhân vật dẫn đường). */
export const FLAT_SPRITES: Record<string, FlatSprite> = { ...FURNITURE_SPRITES, ...SMALL_SPRITES, ...FOOD_SPRITES, ...PROP_SPRITES, ...STORY_SPRITES, ...CHARACTER_SPRITES, ...ANIMAL_SPRITES, ...MARKET_SPRITES, ...STATION_SPRITES, ...HOSPITAL_SPRITES, ...PARK_SPRITES, ...SCHOOL_SPRITES, ...SHOP_SPRITES, ...HOTEL_SPRITES, ...AIRPORT_SPRITES, ...PLACE_SPRITES };
