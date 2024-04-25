import SvelteMixin from "./svelte-mixin.js";
import DuelComponent from "../components/DuelComponent.svelte";

export class DuelApp extends SvelteMixin(DocumentSheet, DuelComponent) {
    get title() {
        return "Roll";
    }
}
