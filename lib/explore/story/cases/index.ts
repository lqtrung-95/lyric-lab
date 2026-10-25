import type { StoryDef } from "../story-types";
import { HOP_GO_CASE } from "./hop-go";

/** Các vụ án hiện có. */
export const CASES: Record<string, StoryDef> = { [HOP_GO_CASE.id]: HOP_GO_CASE };
