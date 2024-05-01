<script>
    import FoundryFormPair from "./FoundryFormPair.svelte";

    export let actor;
    export let name;
    $: id = actor.id;
    $: value = foundry.utils.getProperty(actor, name);
</script>

<FoundryFormPair idPrefix={id} name={name} value={value} let:labelProps let:inputProps>
    <slot labelProps={labelProps} inputProps={inputProps} />
</FoundryFormPair>
