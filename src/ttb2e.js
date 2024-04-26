import FatedApplication from "./applications/fated.js";
import {TtbActor} from "./documents/actor/actor.js";
import TTB2E from "./config.js";
import FatedData from "./data/actor/fated.js";

Hooks.once("init", async () => {
    console.log("HI FROM TTB");
    // Add utility classes to the global game object so that they're more easily
    // accessible in global contexts.
    game.ttb2e = TTB2E;

    // Define custom Document classes
    CONFIG.Actor.documentClass = TtbActor;
    CONFIG.Actor.dataModels.fated = FatedData;
    CONFIG.Actor.trackableAttributes = {
        fated: {
            bar: ["wounds"],
            value: [],
        },
    };

    // Register sheet application classes
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("ttb2e", FatedApplication, {types: ["fated"], makeDefault: true});
});
