import SvelteApplicationMixin from "./svelte-application.js";
import FatedSheet from "../components/FatedSheet.svelte";

const DocumentSheetV2 = foundry.applications.api.DocumentSheetV2;
/**
 * @extends DocumentSheetV2
 * @mixes SvelteApplication
 */
export default class FatedApplication extends SvelteApplicationMixin(DocumentSheetV2) {
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
        }
    };

    /**
     * @param {RenderOptions} options                 Options which configure application rendering behavior
     * @returns {Promise<ApplicationRenderContext>}   Context data for the render operation
     * @protected
     */
    async _prepareContext(options) {
        return {
            actor: this.document,
        };
    }

}
