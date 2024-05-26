import FatedApplication from "./applications/fated.js";
import TtbActor from "./documents/actor.js";
import TTB2E from "./config.js";
import FatedActorData from "./data/actor/fated.js";
import TtbChatMessage from "./documents/chat-message.js";
import TtbCardsDirectory from "./applications/sidebar/cards-directory.js";
import FlipChatMessageData from "./data/chat-message/flip.js";
import FlipChatMessage from "./components/FlipChatMessage.svelte";

Hooks.once("init", async () => {
    game.ttb2e = TTB2E;

    registerSettings();

    // Define custom Document classes
    CONFIG.Actor.documentClass = TtbActor;
    CONFIG.Actor.dataModels.fated = FatedActorData;
    CONFIG.Actor.trackableAttributes = {
        fated: {
            bar: ["wounds"],
            value: [],
        },
    };
    CONFIG.ChatMessage.documentClass = TtbChatMessage;
    CONFIG.ChatMessage.dataModels.flip = FlipChatMessageData;
    CONFIG.ui.cards = TtbCardsDirectory;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ttb2e", FatedApplication, {types: ["fated"], makeDefault: true});
});

Hooks.on("renderTtbCardsDirectory", async (_directory, el, _data) => {
    const fateDeckId = game.settings.get("ttb2e", "fateDeck");
    if (fateDeckId !== "") {
        el.find(`li.directory-item[data-document-id="${fateDeckId}"] .entry-name>a`)
            .prepend('<i class="fa-solid fa-bookmark"></i> ');
    }
    const fateDiscardId = game.settings.get("ttb2e", "fateDiscard");
    if (fateDiscardId !== "") {
        el.find(`li.directory-item[data-document-id="${fateDiscardId}"] .entry-name>a`)
            .prepend('<i class="fa-solid fa-bookmark"></i> ');
    }
});

Hooks.on("updateSetting", setting => {
    if (setting.key === "ttb2e.fateDeck" || setting.key === "ttb2e.fateDiscard") {
        ui.cards.render();
    }
});

Hooks.on("getSceneControlButtons", controls => {
    //TODO)) make this actually do something useful
    controls.find(group => group.name === "token").tools.push({
        name: "cardsApp",
        title: "Cards App",
        icon: "fa-solid fa-cards",
        toggle: true,
        active: game.settings.get("core", NotesLayer.TOGGLE_SETTING),
        onClick: toggled => game.settings.set("core", NotesLayer.TOGGLE_SETTING, toggled),
    });
    // controls.push({
    //     name: "cardsApp",
    //     title: "Cards App",
    //     icon: "fa-solid fa-cards",
    //     toggle: true,
    //     active: game.settings.get("core", NotesLayer.TOGGLE_SETTING),
    //     onClick: toggled => game.settings.set("core", NotesLayer.TOGGLE_SETTING, toggled)
    // });
});

Hooks.on("renderChatMessage", (message, html, data) => {
   if (message.type === "flip") {
       new FlipChatMessage({
           target: html[0],
           props: {},
       });
   }
});

function registerSettings() {
    game.settings.register("ttb2e", "fateDeck", {
        name: "Fate Deck",
        hint: "The ID of the fate deck used.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    });

    game.settings.register("ttb2e", "fateDiscard", {
        name: "Fate Deck Discard Pile",
        hint: "The ID of the discard pile for the fate deck.",
        scope: "world",
        config: true,
        type: String,
        default: "",
    });
}
