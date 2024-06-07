/**
 * @template Value
 * @template NewValue
 * @param {Object<Value>} obj
 * @param {function(value: Value, key: string, obj: Object<Value>): NewValue} func
 * @return {Object<NewValue>}
 */
export function objMap(obj, func) {
  const res = {};
  for (let key in obj) {
    res[key] = func(obj[key], key, obj);
  }
  return res;
}

/**
 *
 * @param {string} key
 * @param {Object} data
 * @return {string}
 */
export let localize = (key, data = {}) => game.i18n.format(key, data);

export function localizeCardName({ value, suit }) {
  if (suit === "redJoker" || suit === "blackJoker")
    return localize(`ttb.cardNames.${suit}`);
  const localizedSuit = localize(`ttb.suits.${suit}.name`);
  return localize(`ttb.cardNames.regular`, { value, suit: localizedSuit });
}

/**
 * Determine if a card can be chosen in a flip
 * @param {TtbCard} card
 * @param {TtbCard[]} allCards
 * @param {number} fateModifier
 * @return {boolean}
 */
export function canCardBeChosen(card, allCards, fateModifier) {
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

const SEVERITY_BY_VALUE = [0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4];

export function getSeverity(value) {
  return SEVERITY_BY_VALUE[value];
}

export function* inclusiveRange(first, last) {
  for (let i = first; i <= last; i++) yield i;
}
