/**
 * @typedef FlipOptions
 * @property {SuitedValue} [targetNumber]
 * @property {SuitedValue} [actingValue]
 * @property {TtbActor} [actor]
 * @property {string} [skill] A string like "skills.sorcery" or "derivedAspects.defense"
 * @property {string} [aspect]
 * @property [action]
 */

import DuelApplication from "./applications/duel.mjs";
import TtbChatMessage from "./documents/chat-message.mjs";
import { canCardBeChosen, localize, localizeSkillCheck } from "./util.mts";

/**
 * Flip exposes the primary way of initiating any sort of flips or duels.
 */
export default class Flip {
  flippedCards;

  /**
   *
   * @param {FlipOptions} options
   */
  constructor(options = {}) {
    this.options = foundry.utils.deepClone(options);
  }

  /**
   * Open a dialog to the user that allows them to set the target number,
   * acting value and fate modifier.
   * @return {Promise<void>}
   */
  async openConfigurationUi() {
    new DuelApplication({
      targetNumber: foundry.utils.deepClone(this.options.targetNumber),
      actingValue: foundry.utils.deepClone(this.options.actingValue),
      title: this.title,
      evaluate: ({ fateModifier, targetNumber, actingValue }) => {
        this.options.targetNumber = targetNumber;
        this.options.actingValue = actingValue;
        this.evaluate({ fateModifier });
      },
    }).render(true);
  }

  get title() {
    return (
      this.options.action?.name ??
      localizeSkillCheck(this.options.skill, this.options.aspect) ??
      localize("ttb.ui.flip")
    );
  }

  /**
   * Actually draw the cards from the fate deck, and record the results.
   * @throws Error When the primary fate deck or fate deck discard pile aren't set.
   * @param fateModifier
   * @param chatNotification
   * @return {Promise<void>}
   */
  async evaluate({ fateModifier, chatNotification = true } = {}) {
    let fateDeck = game.cards.get(game.settings.get("ttb2e", "fateDeck"));
    let fateDiscard = game.cards.get(game.settings.get("ttb2e", "fateDiscard"));
    if (fateDeck == null || fateDiscard == null) {
      throw new Error(
        "You need to set a fate deck and a fate deck discard pile to perform flips.",
      );
    }
    this.flippedCards = await fateDeck.flip(
      fateDiscard,
      Math.abs(fateModifier) + 1,
    );
    for (let card of this.flippedCards) {
      card.canBeChosen = canCardBeChosen(card, this.flippedCards, fateModifier);
    }
    if (chatNotification) {
      await this.postFlip();
    }
  }

  /**
   * Post a chat notification displaying the flipped cards.
   * @param fateModifier
   * @param author
   * @param actor
   * @return {Promise<void>}
   */
  async postFlip({
    fateModifier,
    author = game.user.id,
    actor = this.options.actor ?? undefined,
  } = {}) {
    const messageData = {
      type: "flip",
      style: CONST.CHAT_MESSAGE_STYLES.OTHER,
      author,
      speaker: {
        actor,
      },
      system: {
        ...this.options,
        title: this.title,
        fateModifier: fateModifier,
        flippedCards: this.flippedCards,
      },
    };
    await TtbChatMessage.create(messageData);
  }
}
