import type { StoryDef } from "../story-types";
import { FOUNTAIN_PEN_CASE } from "./fountain-pen";
import { GOLDEN_KEY_CASE } from "./golden-key";
import { LOST_KITE_CASE } from "./lost-kite";
import { LOST_WALLET_CASE } from "./lost-wallet";
import { SPRING_PAINTING_CASE } from "./spring-painting";
import { SWAPPED_CAKE_CASE } from "./swapped-cake";
import { TROPHY_LOAN_CASE } from "./trophy-loan";
import { HOP_GO_CASE } from "./wooden-box";

/** Các vụ án hiện có. */
export const CASES: Record<string, StoryDef> = { [HOP_GO_CASE.id]: HOP_GO_CASE, [GOLDEN_KEY_CASE.id]: GOLDEN_KEY_CASE, [SWAPPED_CAKE_CASE.id]: SWAPPED_CAKE_CASE, [FOUNTAIN_PEN_CASE.id]: FOUNTAIN_PEN_CASE, [LOST_KITE_CASE.id]: LOST_KITE_CASE, [SPRING_PAINTING_CASE.id]: SPRING_PAINTING_CASE, [LOST_WALLET_CASE.id]: LOST_WALLET_CASE, [TROPHY_LOAN_CASE.id]: TROPHY_LOAN_CASE };
