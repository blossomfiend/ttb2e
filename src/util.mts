import type { RankValue, TtbCard } from "./types.mts";

export function objMap<Value, NewValue>(
  obj: Record<string, Value>,
  func: (value: Value, key: string, obj: Record<string, Value>) => NewValue,
): Record<string, NewValue> {
  const res = {};
  for (let key in obj) {
    res[key] = func(obj[key], key, obj);
  }
  return res;
}

export function localize(key: string, data: object = {}): string {
  // @ts-ignore
  return game.i18n.format(key, data);
}

export function localizeCardName({ value, suit }: TtbCard): string {
  if (suit === "redJoker" || suit === "blackJoker")
    return localize(`ttb.cardNames.${suit}`);
  const localizedSuit = localize(`ttb.suits.${suit}.name`);
  return localize(`ttb.cardNames.regular`, { value, suit: localizedSuit });
}

/**
 * Determine if a card can be chosen in a flip
 */
export function canCardBeChosen(
  card: TtbCard,
  allCards: TtbCard[],
  fateModifier: number,
): boolean {
  if (allCards.some((c) => c.suit === "blackJoker")) {
    return card.suit === "blackJoker";
  }
  if (card.suit === "redJoker") {
    return true;
  }
  if (fateModifier < 0) {
    return card.value === Math.min(...allCards.map((c) => c.value));
  }
  return true;
}

export function localizeSkillCheck(skill?: string, aspect?: string) {
  let titleElements = [];
  if (skill != null)
    titleElements.push(localize(`ttb.${skill}.name`));
  if (aspect != null)
    titleElements.push(localize(`ttb.aspects.${aspect}.name`));
  if (titleElements.length === 0) return null;
  return titleElements.join(" + ");
}

export function* inclusiveRange(
  first: number,
  last: number,
): Generator<number> {
  for (let i = first; i <= last; i++) yield i;
}

export function* exclusiveRange(first: number, end: number): Generator<number> {
  for (let i = first; i < end; i++) yield i;
}

export function* intersperse<T, U>(a: Iterable<T>, delim: U): Generator<T | U> {
  let first = true;
  for (const x of a) {
    if (!first) yield delim;
    first = false;
    yield x;
  }
}

export function rankByValue(rankValue: RankValue): {} {
  // @ts-ignore
  return game.ttb2e.rankByValue[Math.clamp(rankValue, 1, 14)];
}
