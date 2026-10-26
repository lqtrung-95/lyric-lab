import type { StoryDef } from "../story-types";
import { GOLDEN_KEY_CASE } from "./golden-key";
import { HOP_GO_CASE } from "./wooden-box";

/** Các vụ án hiện có. */
export const CASES: Record<string, StoryDef> = { [HOP_GO_CASE.id]: HOP_GO_CASE, [GOLDEN_KEY_CASE.id]: GOLDEN_KEY_CASE };
