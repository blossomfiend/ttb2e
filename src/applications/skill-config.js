import SvelteApplicationMixin from "./svelte-application.js";
import SkillConfigComponent from "../components/SkillConfig.svelte";
import {localize} from "../util.js";

export default class SkillConfigApplication extends SvelteApplicationMixin(foundry.applications.api.DocumentSheetV2) {
    #skill;

    constructor(options = {}) {
        options.document = options.actor;
        super(options);
        this.#skill = options.skill;
    }

    static SVELTE_COMPONENT = SkillConfigComponent;
    static DEFAULT_OPTIONS = {
        tag: "form",
        window: {
            contentClasses: ["standard-form"],
        },
        position: {
            width: 300,
        },
        form: {
            closeOnSubmit: true,
        }
    };

    /**
     *
     * @param options
     * @return {*}
     * @protected
     */
    _initializeApplicationOptions(options = {}) {
        options = super._initializeApplicationOptions(options);
        options.uniqueId = `${this.constructor.name}-${options.document.uuid}-${options.skill}`;
        return options;
    }

    /**
     *
     * @param options
     * @return {{skill}}
     * @protected
     */
    _prepareContext(options = {}) {
        return {
            actor: this.document,
            skill: this.#skill,
        };
    }

    /**
     * @override
     */
    get title() {
        return localize("ttb.ui.skillConfigTitle", {
            name: this.document.name,
            skill: localize(`ttb.${this.#skill}.name`),
        });
    }
}
