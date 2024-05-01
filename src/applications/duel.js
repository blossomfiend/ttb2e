import DuelComponent from "../components/DuelDialog.svelte";
import SvelteApplicationMixin from "./svelte-application.js";
import Flip from "../flip.js";

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
            handler: async (event, form, formData) => {
                let flip = new Flip({}, formData.object);
                await flip.postFlip();
            },
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
