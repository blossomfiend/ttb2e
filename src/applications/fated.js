import ActorSheetComponent from "../components/ActorSheet.svelte";
import SvelteMixin from "./svelte-mixin.js";

export class FatedApp extends SvelteMixin(ActorSheet, ActorSheetComponent) {
    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["fated", "sheet", "actor"],
            width: 600,
            height: 600,
        });
    }
}
