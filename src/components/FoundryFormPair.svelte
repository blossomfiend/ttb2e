<script>
    export let idPrefix = null;
    export let name;
    export let value;
    $: id = idPrefix !== null ? `${idPrefix}.${name}` : null;
    $: inputProps = { name, value, ...(id !== null ? {id} : {}) };
    $: labelProps = { "for": (id !== null ? id : null) };
</script>
<slot inputProps={inputProps} labelProps={labelProps} />
