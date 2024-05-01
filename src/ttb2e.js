import FatedApplication from "./applications/fated.js";
import {TtbActor} from "./documents/actor/actor.js";
import TTB2E from "./config.js";
import FatedData from "./data/actor/fated.js";
import TtbCardsDirectory from "./sidebar/cards.js";

Hooks.once("init", async () => {
    console.log("HI FROM TTB");
    game.ttb2e = TTB2E;

    registerSettings();

    // Define custom Document classes
    CONFIG.Actor.documentClass = TtbActor;
    CONFIG.Actor.dataModels.fated = FatedData;
    CONFIG.Actor.trackableAttributes = {
        fated: {
            bar: ["wounds"],
            value: [],
        },
    };
    CONFIG.ui.cards = TtbCardsDirectory;

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ttb2e", FatedApplication, { types: ["fated"], makeDefault: true });
});

Hooks.on("renderTtbCardsDirectory", async (_directory, el, _data) => {
    const fateDeckId = game.settings.get("ttb2e", "fateDeck");
    if (fateDeckId !== "") {
        el.find(`li.directory-item[data-document-id="${fateDeckId}"] .entry-name>a`)
            .prepend('<i class="fa-solid fa-bookmark"></i> ');
    }
});

Hooks.on("updateSetting", (setting) => {
    console.log(setting);
    if (setting.key === "ttb2e.fateDeck") {
        ui.cards.render();
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
}
