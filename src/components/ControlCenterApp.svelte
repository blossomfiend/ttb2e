<script>
    import {localize} from "../util.js";
    import DuelApplication from "../applications/duel.js";
</script>

<div>
    <button on:click={() => new DuelApplication().render({force: true})}>{localize("ttb.ui.flip")}</button>
</div>
