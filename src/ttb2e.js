import {TtbActorSheetSvelte} from "./applications/fated.js";
import {SYSTEM_ID} from "./globals.js";
import {TtbActor} from "./documents/actor/actor.js";
import TTB2E from "./config.js";
import FatedData from "./data/actor/fated.js";


Hooks.once('init', async () => {
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
    Actors.registerSheet("TtbActorSheet", TtbActorSheetSvelte, {makeDefault: true});

    // Preload Handlebars templates.
    await preloadTemplates();
});

async function preloadTemplates() {
    const templatePaths = [`systems/${SYSTEM_ID}/templates/svelte_form.hbs`];

    return await loadTemplates(templatePaths);
}
