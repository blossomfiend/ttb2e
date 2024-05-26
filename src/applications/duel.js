import DuelComponent from "../components/DuelDialog.svelte";
import SvelteApplicationMixin from "./svelte-application.js";
import {localize} from "../util.js";

export default class DuelApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
    #actor;
    #aspect;
    #skill;

    constructor(actor, {aspect, skill} = {}) {
        super();
        this.#actor = actor;
        this.#aspect = aspect;
        this.#skill = skill;
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
        return localize("ttb.ui.duelConfigTitle", {
            skill: localize(`ttb.${this.#skill}.name`),
            aspect: localize(`ttb.aspects.${this.#aspect}.name`),
        });
    }
}
