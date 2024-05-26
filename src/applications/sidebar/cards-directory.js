export default class TtbCardsDirectory extends CardsDirectory {
    /** @inheritDoc */
    _getEntryContextOptions() {
        const options = super._getEntryContextOptions();
        return [
            ...options,
            {
                name: "ttb.ui.setAsFateDeck",
                icon: '<i class="fa-solid fa-bookmark"></i>',
                condition: header => {
                    if (!game.user.isGM) return false;
                    const li = header.closest(".directory-item");
                    const cards = this.collection.get(li.data("documentId"));
                    return cards.type === "deck";
                },
                callback: header => {
                    const li = header.closest(".directory-item");
                    const cards = this.collection.get(li.data("documentId"));
                    game.settings.set("ttb2e", "fateDeck", cards.id);
                },
            },
            {
                name: "ttb.ui.setAsFateDiscard",
                icon: '<i class="fa-solid fa-bookmark"></i>',
                condition: header => {
                    if (!game.user.isGM) return false;
                    const li = header.closest(".directory-item");
                    const cards = this.collection.get(li.data("documentId"));
                    return cards.type === "pile";
                },
                callback: header => {
                    const li = header.closest(".directory-item");
                    const cards = this.collection.get(li.data("documentId"));
                    game.settings.set("ttb2e", "fateDiscard", cards.id);
                },
            },
        ];
    }
}
