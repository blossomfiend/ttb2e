import "./style.css";
import TTB2E from "./game-data.mjs";

import FatedActorData from "./data/actor/fated.mjs";
import FatemasterCharacterActorData from "./data/actor/fatemaster-character.mjs";
import FlipChatMessageData from "./data/chat-message/flip.mjs";

import TtbActor from "./documents/actor.mjs";
import TtbCards from "./documents/cards.mjs";
import TtbChatMessage from "./documents/chat-message.mjs";

import ControlCenterApplication from "./applications/control-center.mjs";
import CharacterApplication from "./applications/character.mjs";
import TtbCardsDirectory from "./applications/sidebar/cards-directory.mjs";

Hooks.once("init", async () => {
  game.ttb2e = TTB2E;

  registerSettings();

  // Define custom Document classes
  CONFIG.Actor.documentClass = TtbActor;
  CONFIG.Actor.dataModels.fated = FatedActorData;
  CONFIG.Actor.dataModels.fatemasterCharacter = FatemasterCharacterActorData;
  CONFIG.Actor.trackableAttributes = {
    fated: {
      bar: ["wounds", "fatePoints"],
      value: [],
    },
  };
  CONFIG.ChatMessage.documentClass = TtbChatMessage;
  CONFIG.ChatMessage.dataModels.flip = FlipChatMessageData;
  CONFIG.ui.cards = TtbCardsDirectory;
  CONFIG.Cards.documentClass = TtbCards;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("ttb2e", CharacterApplication, {
    types: ["fated", "fatemasterCharacter"],
    makeDefault: true,
  });
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
