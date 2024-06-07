export default class TtbCards extends Cards {
  /**
   *
   * @param {TtbCards} discardPile the pile to source additional cards from
   * @param {number} [amount = 1] how many cards to draw
   * @param [updateData] optional update data
   * @param [to] the target pile
   * @param {number} [how] one of CONST.CARD_DRAW_MODES
   * @return {Promise<Card[]>}
   */
  async flip(
    discardPile,
    amount = 1,
    { updateData = {}, to = discardPile, how = CONST.CARD_DRAW_MODES.TOP } = {},
  ) {
    const drawn = await this.#drawTopWithDiscard(discardPile, amount);

    const toCreate = drawn.map((card) => {
      const createData = foundry.utils.mergeObject(card.toObject(), updateData);
      createData.origin = this.id;
      createData.drawn = true;
      return createData;
    });

    return await to.createEmbeddedDocuments("Card", toCreate, {
      keepId: true,
    });
  }

  /**
   * Draws some cards from this deck and the provided discard pile, returning the now drawn card objects.
   * @param discardPile
   * @param amount
   * @param updateData
   * @param how
   * @return {Promise<Card[]>}
   * @private
   */
  async #drawTopWithDiscard(
    discardPile,
    amount,
    { updateData = {}, how = CONST.CARD_DRAW_MODES.TOP } = {},
  ) {
    if (!(discardPile instanceof TtbCards))
      throw new Error("You must provide a discard pile.");
    if (this.type !== "deck")
      throw new Error("You should only use this method on a deck.");
    if (amount > this.availableCards.length + discardPile.cards.size)
      throw new Error("There aren't enough cards left.");

    // Draw as many cards as possible right away
    let drawn = this._drawCards(
      Math.min(this.availableCards.length, amount),
      how,
    );
    await this.updateEmbeddedDocuments(
      "Card",
      drawn.map((card) => ({ _id: card.id, drawn: true })),
    );

    // If we don't have enough cards, time to reset the deck!
    if (drawn.length < amount) {
      await discardPile.recall({ chatNotification: false });
      await this.shuffle({ chatNotification: true });
      const cardsLeftToDraw = amount - drawn.length;
      const moreDrawn = this._drawCards(cardsLeftToDraw, how);
      await this.updateEmbeddedDocuments(
        "Card",
        moreDrawn.map((card) => ({ _id: card.id, drawn: true })),
      );
      drawn = [...drawn, ...moreDrawn];
    }

    return drawn;
  }
}
