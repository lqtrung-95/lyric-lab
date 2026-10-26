import type { StoryDef } from "../story-types";
import { FOUNTAIN_PEN_CASE } from "./fountain-pen";
import { GOLDEN_KEY_CASE } from "./golden-key";
import { LOST_TOOLBOX_CASE } from "./lost-toolbox";
import { SLOW_CLOCK_CASE } from "./slow-clock";
import { LOST_PARCEL_CASE } from "./lost-parcel";
import { LOST_KITE_CASE } from "./lost-kite";
import { LOST_WALLET_CASE } from "./lost-wallet";
import { SPRING_PAINTING_CASE } from "./spring-painting";
import { SWAPPED_PHONE_CASE } from "./swapped-phone";
import { SWAPPED_CAKE_CASE } from "./swapped-cake";
import { TROPHY_LOAN_CASE } from "./trophy-loan";
import { HOP_GO_CASE } from "./wooden-box";

/** Các vụ án hiện có. */
export const CASES: Record<string, StoryDef> = { [HOP_GO_CASE.id]: HOP_GO_CASE, [LOST_PARCEL_CASE.id]: LOST_PARCEL_CASE, [LOST_TOOLBOX_CASE.id]: LOST_TOOLBOX_CASE, [SLOW_CLOCK_CASE.id]: SLOW_CLOCK_CASE, [SWAPPED_PHONE_CASE.id]: SWAPPED_PHONE_CASE, [GOLDEN_KEY_CASE.id]: GOLDEN_KEY_CASE, [SWAPPED_CAKE_CASE.id]: SWAPPED_CAKE_CASE, [FOUNTAIN_PEN_CASE.id]: FOUNTAIN_PEN_CASE, [LOST_KITE_CASE.id]: LOST_KITE_CASE, [SPRING_PAINTING_CASE.id]: SPRING_PAINTING_CASE, [LOST_WALLET_CASE.id]: LOST_WALLET_CASE, [TROPHY_LOAN_CASE.id]: TROPHY_LOAN_CASE };
