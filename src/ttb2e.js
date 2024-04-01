import {TtbActorSheetSvelte} from "./applications/TtbActorSheet.svelte.js";
import {SYSTEM_ID} from "./globals.js";
import {TtbActor} from "./documents/actor/TtbActor.js";
import TTB2E from "./config.js";
import FatedData from "./data/actor/FatedData.js";

Hooks.once('init', async () => {
    // Add utility classes to the global game object so that they're more easily
    // accessible in global contexts.
    game[SYSTEM_ID] = TTB2E;

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

    return loadTemplates(templatePaths);
}
