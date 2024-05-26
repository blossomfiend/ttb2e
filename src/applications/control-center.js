import SvelteApplicationMixin from "./svelte-application.js";
import ControlCenterApp from "../components/ControlCenterApp.svelte";

export default class ControlCenterApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
    static SVELTE_COMPONENT = ControlCenterApp;
    static DEFAULT_OPTIONS = {
        id: "card-control-center",
        tag: "aside",
        window: {
            title: "ttb.ui.controlCenter",
            icon: "fa-solid fa-cards",
        },
    };
}
