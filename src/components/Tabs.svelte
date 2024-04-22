<script>
    import {quintOut, quintIn, expoOut, quartIn} from "svelte/easing";

    /**
     * @type {{id: string}[]}
     */
    export let tabs = [];
    /**
     * @type {string}
     */
    export let currentTab;

    let transition = (
        node,
        {delay = 0, duration = 200, easing = quintOut, start = 0.98, opacity = 0} = {}
    ) => {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);

        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
                transform: ${transform} scale(${1 - sd * u});
                opacity: ${target_opacity - od * u};
            `
        };
    };
</script>

<div class="grid grid-cols-1 grid-rows-1">
    {#each tabs as tab (tab.id)}
        {#if tab.id === currentTab}
            <div
                class="tab col-start-1 row-start-1"
                in:transition={{ delay: 50, easing: expoOut, duration: 150 }}
                out:transition={{ easing: quartIn, duration: 100 }}>
                <slot id={tab.id}/>
            </div>
        {/if}
    {/each}
</div>
