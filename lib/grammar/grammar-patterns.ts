import { HSK1_PATTERNS } from "./patterns-hsk1";
import { HSK2_PATTERNS } from "./patterns-hsk2";
import { HSK3_PATTERNS } from "./patterns-hsk3";
import { HSK4_PATTERNS } from "./patterns-hsk4";
import type { GrammarLevel, GrammarPattern } from "./grammar-types";

export const GRAMMAR_PATTERNS: GrammarPattern[] = [...HSK1_PATTERNS, ...HSK2_PATTERNS, ...HSK3_PATTERNS, ...HSK4_PATTERNS];

export const grammarById = (id: string): GrammarPattern | undefined => GRAMMAR_PATTERNS.find((p) => p.id === id);
export const patternsOfLevel = (level: GrammarLevel): GrammarPattern[] => GRAMMAR_PATTERNS.filter((p) => p.level === level);
export const isGrammarLevel = (n: number): n is GrammarLevel => n >= 1 && n <= 4 && Number.isInteger(n);
