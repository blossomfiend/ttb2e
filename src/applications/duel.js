import DuelComponent from "../components/DuelDialog.svelte";
import SvelteApplicationMixin from "./svelte-application.js";
import {localize} from "../util.js";

export default class DuelApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
    #actor;
    #aspect;
    #skill;

    constructor(options = {}) {
        super(options);
        this.#actor = options.actor;
        this.#aspect = options.aspect;
        this.#skill = options.skill;
    }

    static SVELTE_COMPONENT = DuelComponent;

    /**
     * @override
     */
    static DEFAULT_OPTIONS = {
        tag: "div",
        window: {
            contentClasses: ["standard-form"],
            icon: "fa-regular fa-cards",
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
            close: () => this.close(),
            actor: this.#actor,
            aspect: this.#aspect,
            skill: this.#skill,
        };
    }

    /**
     * @override
     */
    get title() {
        return localize("ttb.ui.duelConfigTitle");
    }
}
