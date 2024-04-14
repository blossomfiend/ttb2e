<script>
    export let actor;
    let categories = game.ttb2e.skillCategories;
    let skills = Object.values(actor.system.skills);
    let localize = key => game.i18n.format(key);
</script>

<div class="tw-flex tw-flex-col">
    <h2>Search</h2>
    <div class="tw-grid tw-grid-cols-2 tw-gap-3">
        {#each categories as category}
            <div class="tw-flex tw-flex-col tw-gap-2 tw-rounded">
                <h3>{ localize(`ttb.skillCategories.${category}`) }</h3>
                <div class="tw-flex tw-flex-row tw-flex-wrap tw-gap-2">
                    {#each skills.filter(skill => skill.category === category) as skill}
                        <div class="tw-flex tw-flex-col tw-shadow tw-h-16 tw-p-2">
                            <h4>{ localize(`ttb.skills.${skill.name}.name`) }</h4>
                            <div class="tw-flex tw-flex-row tw-gap-1">
                                <div>{ skill.rank }</div>
                                <div>/</div>
                                {#if typeof skill.aspect === "string"}
                                    <div>{ skill.av.value }</div>
                                {:else}
                                    <div>{ skill.av[skill.aspect[0]].value } ({ localize(`ttb.aspects.${skill.aspect[0]}.name`) })</div>
                                    <div>/</div>
                                    <div>{ skill.av[skill.aspect[1]].value } ({ localize(`ttb.aspects.${skill.aspect[1]}.name`) })</div>
                                {/if}
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        {/each}
    </div>
</div>
