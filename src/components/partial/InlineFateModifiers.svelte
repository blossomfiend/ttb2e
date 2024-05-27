<script>
    /** @type number */
    export let fateModifier;
    let className = "";
    export {className as class};
    $: modifierCount = Math.abs(fateModifier);
    $: modifierType = fateModifier > 0 ? "plus" : "minus";
    $: modifierList = Array(modifierCount).fill(modifierType);
</script>

{#each modifierList as variant}
    <i class={`ttb-icon-${variant} ${className}`}/>
{/each}
