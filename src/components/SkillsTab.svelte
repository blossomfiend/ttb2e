<script>
    export let actor;
    let categories = game.ttb2e.skillCategories;
    let skills = Object.values(actor.system.skills);
    let localize = key => game.i18n.format(key);
</script>

<div class="tw-flex tw-flex-col">
    <h2>Search</h2>
    <div class="tw-grid tw-grid-cols-3 tw-gap-3">
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

                    <table>
                        <thead>
                            <tr>
                                <th>Skill</th>
                                <th>Rank</th>
                                <th>AV</th>
                            </tr>
                        </thead>
                        {#each skills.filter(skill => skill.category === category) as skill}
                            <tr>
                                <td>{ localize(`ttb.skills.${skill.name}.name`) }</td>
                                <td class="tw-text-center">{ skill.rank }</td>
                                <td class="tw-text-center">{ skill.av.value }</td>
                            </tr>
                        {/each}
                    </table>


                    {#each skills.filter(skill => skill.category === category) as skill}
                        <div class="tw-flex tw-flex-row tw-justify-between tw-items-center tw-bg-parchment-light tw-shadow tw-rounded tw-w-full tw-p-1">
                            <div class="tw-flex tw-flex-row tw-items-center tw-gap-2">
                                <div class="tw-flex tw-flex-col tw-items-center">
                                    <div class="tw-text-sm tw-leading-none small-caps">Rank</div>
                                    <div class="tw-text-base tw-leading-none">{ skill.rank }</div>
                                </div>
                                <div>{ localize(`ttb.skills.${skill.name}.name`) }</div>
                            </div>
                            <div class="tw-flex tw-flex-row tw-gap-1">
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


<style>
    .small-caps {
        font-variant: small-caps;
    }
</style>
