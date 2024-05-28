/**
 * @template Value
 * @template NewValue
 * @param {Object<Value>} obj
 * @param {function(value: Value, key: string, obj: Object<Value>): NewValue} func
 * @return {Object<NewValue>}
 */
export function objMap(obj, func) {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, func(v, k, obj)]));
}

/**
 *
 * @param {string} key
 * @param {Object} data
 * @return {string}
 */
export let localize = (key, data = {}) => game.i18n.format(key, data);

export function localizeCardName({value, suit}) {
    if (suit === "redJoker" || suit === "blackJoker") return localize(`ttb.cardNames.${suit}`);
    const localizedSuit = localize(`ttb.suits.${suit}.name`);
    return localize(`ttb.cardNames.regular`, {value, suit: localizedSuit});
}

/**
 * Determine if a card can be chosen in a flip
 * @param {TtbCard} card
 * @param {TtbCard[]} allCards
 * @param {number} fateModifier
 * @return {boolean}
 */
export function canCardBeChosen(card, allCards, fateModifier) {
    if (allCards.some(c => c.suit === "blackJoker")) {
        return card.suit === "blackJoker";
    }
    if (card.suit === "redJoker") {
        return true;
    }
    if (fateModifier < 0) {
        return card.value === Math.min(...allCards.map(c => c.value));
    }
    return true;
}
