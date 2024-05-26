import DuelComponent from "../components/DuelDialog.svelte";
import SvelteApplicationMixin from "./svelte-application.js";
import Flip from "../flip.js";

export default class DuelApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
    #aspect;
    #skill;
    #av;

    constructor(options = {}) {
        super();
        this.#aspect = options.aspect;
        this.#skill = options.skill;
        this.#av = options.av;
    }

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
                const fateModifier = +event.submitter.dataset.fateModifier;
                let flip = new Flip({fateModifier}, formData.object);
                await flip.postFlip();
            },
        },
        position: {
            width: 480,
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
            aspect: this.#aspect,
            skill: this.#skill,
            av: this.#av,
        };
    }

    /**
     * @override
     */
    get title() {
        return "Flip";
    }
}
