export default class TtbCards extends Cards {
    /**
     *
     * @param {TtbCards} discardPile
     * @param {number} [amount = 1]
     * @return {Promise<Card[]>}
     */
    async flip(discardPile, amount = 1) {
        if (!(discardPile instanceof TtbCards)) {
            throw new Error("You must provide a discard pile.");
        }
        if (this.type !== "deck") {
            throw new Error("You should only use `flip` on a deck.");
        }

        // Draw as many cards as possible right away
        let drawn = this._drawCards(Math.min(this.availableCards.length, amount), CONST.CARD_DRAW_MODES.TOP);
        await this.updateEmbeddedDocuments("Card", drawn.map(card => ({_id: card.id, drawn: true})));

        // If we don't have enough cards, time to reset the fate deck!
        if (drawn.length < amount) {
            await discardPile.recall({chatNotification: false});
            await this.shuffle({chatNotification: true});
            const cardsLeftToDraw = amount - drawn.length;
            const moreDrawn = this._drawCards(cardsLeftToDraw, CONST.CARD_DRAW_MODES.TOP);
            await this.updateEmbeddedDocuments("Card", moreDrawn.map(card => ({_id: card.id, drawn: true})));
            drawn = [...drawn, ...moreDrawn];
        }

        const toCreate = drawn.map(card => {
            let createData = card.toObject();
            createData.origin = this.id;
            return createData;
        });

        return await discardPile.createEmbeddedDocuments("Card", toCreate, {keepId: true});
    }
}
