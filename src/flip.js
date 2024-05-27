/**
 * @typedef {Object} FlipOptions
 * @property {-3|-2|-1|0|1|2|3} fateModifier
 */

/**
 * @typedef {Object} FlipData
 * @property {SuitedValue|null} targetNumber
 * @property {SuitedValue|null} actingValue
 */

import "./components/FlipChatMessage.svelte";
import TtbChatMessage from "./documents/chat-message.js";

/**
 *
 */
export default class Flip {
    /**
     *
     * @param {FlipOptions} options This flips definition
     * @param {FlipData} data The roll data context of this flip
     */
    constructor(options, data) {
        this.options = options;
        this.data = data;
    }

    /**
     * @type {FlipOptions}
     */
    options;

    /**
     * @type {FlipData}
     */
    data;

    flippedCards;

    async evaluate() {
        let fateDeck = game.cards.get(game.settings.get("ttb2e", "fateDeck"));
        let fateDiscard = game.cards.get(game.settings.get("ttb2e", "fateDiscard"));
        this.flippedCards = await fateDeck.flip(fateDiscard, Math.abs(this.options.fateModifier) + 1);
        await this.postFlip();
    }

    async postFlip() {
        let flippedCards = this.flippedCards.map(card => ({
            value: card.value,
            suit: card.suit,
        }));
        await TtbChatMessage.create({
            type: "flip",
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            author: game.user.id,
            speaker: {
                actor: this.data?.actor ?? undefined,
            },
            system: {
                ...this.data,
                fateModifier: this.options.fateModifier,
                flippedCards: flippedCards,
            },
        });
    }
}
