import { localize, localizeCardName } from "../../util.mjs";

export default class TtbCardsDirectory extends CardsDirectory {
  /** @inheritDoc */
  _getEntryContextOptions() {
    const options = super._getEntryContextOptions();
    return [
      ...options,
      {
        name: "ttb.ui.setAsFateDeck",
        icon: '<i class="fa-solid fa-bookmark"></i>',
        condition: (header) => {
          if (!game.user.isGM) return false;
          const li = header.closest(".directory-item");
          const cards = this.collection.get(li.data("documentId"));
          return cards.type === "deck";
        },
        callback: (header) => {
          const li = header.closest(".directory-item");
          const cards = this.collection.get(li.data("documentId"));
          game.settings.set("ttb2e", "fateDeck", cards.id);
        },
      },
      {
        name: "ttb.ui.setAsFateDiscard",
        icon: '<i class="fa-solid fa-bookmark"></i>',
        condition: (header) => {
          if (!game.user.isGM) return false;
          const li = header.closest(".directory-item");
          const cards = this.collection.get(li.data("documentId"));
          return cards.type === "pile";
        },
        callback: (header) => {
          const li = header.closest(".directory-item");
          const cards = this.collection.get(li.data("documentId"));
          game.settings.set("ttb2e", "fateDiscard", cards.id);
        },
      },
    ];
  }
}

Hooks.on("renderTtbCardsDirectory", (cardsDirectory, html, data) => {
  // inject little icons to indicate the currently used fate deck
  const fateDeckId = game.settings.get("ttb2e", "fateDeck");
  if (fateDeckId !== "") {
    html
      .find(`li.directory-item[data-document-id="${fateDeckId}"] .entry-name>a`)
      .prepend('<i class="fa-solid fa-bookmark"></i> ');
  }
  const fateDiscardId = game.settings.get("ttb2e", "fateDiscard");
  if (fateDiscardId !== "") {
    html
      .find(
        `li.directory-item[data-document-id="${fateDiscardId}"] .entry-name>a`,
      )
      .prepend('<i class="fa-solid fa-bookmark"></i> ');
  }

  // inject a fate deck creation button
  async function createFateDeck() {
    const toCreate = game.ttb2e.fateDeck.map(({ value, suit }) => ({
      value,
      suit,
      name: localizeCardName({ value, suit }),
      faces: [{}],
      face: 0,
    }));
    const folder = await Folder.create({
      name: localize("ttb.cardPile.fateDeck"),
      type: "Cards",
      color: "#5d142b",
      sorting: "m",
      sort: -1000000,
    });
    const [fateDeck, fateDiscard] = await Cards.createDocuments([
      {
        name: localize("ttb.cardPile.fateDeck"),
        type: "deck",
        folder,
      },
      {
        name: localize("ttb.cardPile.fateDeckDiscardPile"),
        type: "pile",
        folder,
      },
    ]);
    game.settings.set("ttb2e", "fateDeck", fateDeck.id);
    game.settings.set("ttb2e", "fateDiscard", fateDiscard.id);
    await fateDeck.createEmbeddedDocuments("Card", toCreate);
    await fateDeck.shuffle({ chatNotification: false });
  }

  html
    .find(".header-actions")
    .after(
      `<div class="action-buttons flexrow">
        <button class="create-fate-deck">
           <i class="fa-solid fa-wand-sparkles"></i> Create Fate Deck
        </button>
      </div>`,
    )
    .find(".create-fate-deck")
    .on("click", createFateDeck);
});

Hooks.on("updateSetting", (setting) => {
  // rerender the cards directory to show the small little icons
  if (setting.key === "ttb2e.fateDeck" || setting.key === "ttb2e.fateDiscard") {
    ui.cards.render();
  }
});
