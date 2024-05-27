import SvelteApplicationMixin from "./svelte-application.js";
import ControlCenter from "../components/ControlCenter.svelte";

export default class ControlCenterApplication extends SvelteApplicationMixin(foundry.applications.api.ApplicationV2) {
    static SVELTE_COMPONENT = ControlCenter;
    static DEFAULT_OPTIONS = {
        id: "card-control-center",
        tag: "aside",
        window: {
            title: "ttb.ui.controlCenter",
            icon: "fa-solid fa-cards",
        },
    };
}
