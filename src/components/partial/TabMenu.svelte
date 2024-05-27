<script>
    export let tabs = [];
    export let currentTab = null;
    export let onTabChange = () => {};
    export let idFunction = tab => tab.id;
    export let nameFunction = tab => tab.name;

    const handleClick = tab => () => onTabChange(tab);
</script>

{#each tabs as tab}
    <a class="overflow-x-hidden text-clip overflow-y-visible p-2"
       class:active={idFunction(currentTab) === idFunction(tab)}
       on:click={handleClick(tab)}>
        {nameFunction(tab)}
    </a>
{/each}

<style>
    a.active {
        @apply text-shadow-red;
    }
</style>
