import SvelteApplicationMixin from "./svelte-application.js";
import {localize} from "../util.js";
import TwistDeckInitialization from "../components/TwistDeckInitialization.svelte";

export default class TwistDeckInitApplication extends SvelteApplicationMixin(foundry.applications.api.DocumentSheetV2) {
    static SVELTE_COMPONENT = TwistDeckInitialization;
    static DEFAULT_OPTIONS = {
        tag: "div",
        window: {
            contentClasses: ["standard-form"],
        },
        position: {
            width: 300,
        },
    };

    /**
     *
     * @param options
     * @return {{skill}}
     * @protected
     */
    _prepareContext(options = {}) {
        return {
            close: () => this.close(),
            document: this.document,
        };
    }

    /**
     * @override
     */
    get title() {
        return localize("ttb.ui.twistDeckInitTitle", {
            name: this.document.name,
        });
    }
}
