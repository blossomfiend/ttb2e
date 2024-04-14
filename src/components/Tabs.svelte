<script>
    export let tabs = [];
    export let currentTab = null;
    export let onTabChange = () => {};
    export let idFunction = tab => tab.id;
    export let nameFunction = tab => tab.name;

    const handleClick = tab => () => onTabChange(tab);
</script>

{#each tabs as tab}
    <a class={`item${(idFunction(currentTab) === idFunction(tab)) ? ' active' : ''}`} on:click={handleClick(tab)}>{nameFunction(tab)}</a>
{/each}
