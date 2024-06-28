import type { TtbGameData } from "./game-data.mjs";

export interface TtbCard {
  value: number;
  suit: CardSuit;
}

export type Suit = TtbGameData["suits"][number];

export type CardSuit = Suit | "redJoker" | "blackJoker";

export interface SuitedValue {
  value: number;
  suits: Suits;
}

export interface Suits {
  rams: number;
  crows: number;
  tomes: number;
  masks: number;
}

export type RankValue =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14;

export interface TriggerData {
  suits: Suits;
  name: string;
  // Raw HTML description
  description: string;
}

export interface Damage {
  weak: number;
  moderate: number;
  severe: number;
}
