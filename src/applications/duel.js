import DuelComponent from "../components/DuelComponent.svelte";
import SvelteApplicationMixin from "./svelte-application.js";

const ApplicationV2 = foundry.applications.api.ApplicationV2;

export default class DuelApplication extends SvelteApplicationMixin(ApplicationV2) {
    static SVELTE_COMPONENT = DuelComponent;

    /**
     * @override
     */
    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            contentClasses: ["standard-form"],
            icon: "fa-regular fa-cards",
        },
        form: {
            closeOnSubmit: true,
        },
        position: {
            width: 360,
            height: "auto"
        },
    };

    /**
     * @protected
     * @override
     */
    async _prepareContext(options) {
        return {
            actor: this.document,
        };
    }

    /**
     * @override
     */
    get title() {
        return "Roll";
    }
}
