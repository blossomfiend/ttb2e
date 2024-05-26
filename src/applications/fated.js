import SvelteApplicationMixin from "./svelte-application.js";
import FatedSheet from "../components/FatedSheet.svelte";

/**
 * @extends foundry.applications.sheets.ActorSheetV2
 * @mixes SvelteApplication
 */
export default class FatedApplication extends SvelteApplicationMixin(foundry.applications.sheets.ActorSheetV2) {
    /**
     * @override
     */
    static SVELTE_COMPONENT = FatedSheet;

    /**
     * @override
     */
    static DEFAULT_OPTIONS = {
        window: {
            minimizable: true,
            resizable: true,
            contentClasses: [],
        },
        form: {
            submitOnChange: true,
        },
        position: {
            height: 800,
            width: 600,
        },
    };

    /**
     * @protected
     * @override
     */
    async _prepareContext(options) {
        return {
            actor: this.actor,
            token: this.token,
        };
    }
}
