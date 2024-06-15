/**
 * @typedef {Object} FlipOptions
 * @property {-3|-2|-1|0|1|2|3} fateModifier
 */

/**
 * @typedef {Object} FlipData
 * @property {SuitedValue|null} targetNumber
 * @property {SuitedValue|null} actingValue
 */

import TtbChatMessage from "./documents/chat-message.mjs";

/**
 *
 */
export default class Flip {
  /**
   * @type {FlipOptions}
   */
  options;
  /**
   * @type {FlipData}
   */
  data;
  flippedCards;

  /**
   *
   * @param {FlipOptions} options This flips definition
   * @param {FlipData} data The roll data context of this flip
   */
  constructor(options, data) {
    this.options = options;
    this.data = data;
  }

  async evaluate({ chatMessage = true } = {}) {
    let fateDeck = game.cards.get(game.settings.get("ttb2e", "fateDeck"));
    let fateDiscard = game.cards.get(game.settings.get("ttb2e", "fateDiscard"));
    this.flippedCards = await fateDeck.flip(
      fateDiscard,
      Math.abs(this.options.fateModifier) + 1,
    );
    // for (let card of this.flippedCards) {
    //     card.canBeChosen = this.#canCardBeChosen()
    // }
    // this.flippedCards = this.flippedCards.map(card => ({
    //     ...card,
    //     canBeChosen: this.#canCardBeChosen(card),
    // }));
    if (chatMessage) {
      await this.postFlip();
    }
  }

  async postFlip() {
    const data = {
      type: "flip",
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      author: game.user.id,
      speaker: {
        actor: this.data?.actor ?? undefined,
      },
      system: {
        ...this.data,
        fateModifier: this.options.fateModifier,
        flippedCards: this.flippedCards,
      },
    };
    logger.info(data);
    await TtbChatMessage.create(data);
  }
}
