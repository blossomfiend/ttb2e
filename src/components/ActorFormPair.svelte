<script>
    import FoundryFormPair from "./FoundryFormPair.svelte";
    import {get} from "../util.js";

    export let actor;
    export let name;
    $: id = actor.id;
    $: value = get(actor, name);
</script>

<FoundryFormPair idPrefix={id} name={name} value={value} let:labelProps let:inputProps>
    <slot labelProps={labelProps} inputProps={inputProps} />
</FoundryFormPair>
