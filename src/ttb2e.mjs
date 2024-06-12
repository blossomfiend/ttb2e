import "./style.css";
import ttbGameData from "./game-data.mts";

import FatedActorData from "./data/actor/fated.mjs";
import FatemasterCharacterActorData from "./data/actor/fatemaster-character.mjs";
import TriggerData from "./data/item/trigger.mjs";
import FlipChatMessageData from "./data/chat-message/flip.mjs";

import TtbActor from "./documents/actor.mjs";
import TtbItem from "./documents/item.mjs";
import TtbCards from "./documents/cards.mjs";
import TtbChatMessage from "./documents/chat-message.mjs";

import CharacterSheet from "./applications/character.mjs";
import TriggerSheet from "./applications/trigger.mjs";
import TtbCardsDirectory from "./applications/sidebar/cards-directory.mjs";
import ControlCenterApplication from "./applications/control-center.mjs";

Hooks.once("init", async () => {
  game.ttb2e = ttbGameData;

  registerSettings();

  // Actors
  CONFIG.Actor.documentClass = TtbActor;
  CONFIG.Actor.dataModels.fated = FatedActorData;
  CONFIG.Actor.dataModels.fatemasterCharacter = FatemasterCharacterActorData;
  CONFIG.Actor.trackableAttributes = {
    fated: {
      bar: ["wounds", "fatePoints"],
      value: [],
    },
  };
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ttb2e", CharacterSheet, {
    types: ["fated", "fatemasterCharacter"],
    makeDefault: true,
  });

  // Items
  CONFIG.Item.documentClass = TtbItem;
  CONFIG.Item.dataModels.trigger = TriggerData;
  Items.registerSheet("ttb2e", TriggerSheet, {
    types: ["trigger"],
    makeDefault: true,
  });

  CONFIG.ChatMessage.documentClass = TtbChatMessage;
  CONFIG.ChatMessage.dataModels.flip = FlipChatMessageData;

  CONFIG.Cards.documentClass = TtbCards;
  CONFIG.ui.cards = TtbCardsDirectory;
});

Hooks.on("getSceneControlButtons", (controls) => {
  controls
    .find((group) => group.name === "token")
    .tools.push({
      name: "cardsApp",
      title: "Cards App",
      icon: "fa-solid fa-cards",
      button: true,
      onClick: () => new ControlCenterApplication().render(true),
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

Hooks.on("renderChatMessage", async (message, html, data) => {
  if (message.type === "flip") {
    const { renderChatMessage } = await import(
      "./components/flip-chat-message.jsx"
    );
    renderChatMessage(message, html, data);
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
