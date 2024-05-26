<script>
    import {fly} from "svelte/transition";
    import NumberInput from "./NumberInput.svelte";
    import {localize} from "../util.js";
    import TextSuits from "./TextSuits.svelte";
    import DuelApplication from "../applications/duel.js";

    export let actor;
    let categories = game.ttb2e.skillCategories;
    $: skills = Object.values(actor.system.skills);

    const renderDuel = (skill, aspect) => {
        new DuelApplication({skill, aspect}).render({force: true});
    }
</script>


<div class="grid grid-cols-2 gap-4">
    {#each categories as category, categoryIdx (category)}
        <div class="flex flex-col gap-1">
            <h3 class="border-none text-16">{ localize(`ttb.skillCategories.${category}`) }</h3>

            <div class="flex flex-col divide-y w-full">
                {#each skills.filter(skill => skill.category === category) as skill, skillIdx (skill.name)}
                    <div
                        class="flex flex-row justify-between items-center border-border-dark-5 dark:border-border-light-2/50 w-full p-0"
                        in:fly|global={{ delay: skillIdx * 15 + categoryIdx * 40, duration: 250, y: 40 }}>
                        <div class="flex flex-row items-center gap-2 overflow-hidden">
                            <label class="flex flex-col items-center p-1">
                                <span class="w-8">
                                    <NumberInput name={`system.skills.${skill.name}.rank`} value={skill.rank}/>
                                </span>
                                <span
                                    class="text-13 leading-none small-caps text-text-dark-secondary dark:text-stone-300">{localize("ttb.ui.rank")}</span>
                            </label>
                            <div class="p-1 hover:text-shadow-red truncate">
                                { localize(`ttb.skills.${skill.name}.name`) }
                            </div>
                        </div>
                        <div class="flex flex-row gap-2 h-full">
                            {#each skill.aspects as aspect (aspect)}
                                <div
                                    class="flex flex-col gap-0 items-center hover:drop-shadow-red hover:cursor-pointer min-w-10 h-full justify-center"
                                    on:click={() => renderDuel(skill.name, aspect)}>
                                    <div class="leading-none">
                                        <span>{ skill.av[aspect].value }</span>
                                        <TextSuits suits={skill.av[aspect].suits}/>
                                    </div>
                                    <div
                                        class="italic text-11 leading-none text-text-dark-secondary dark:text-stone-300">
                                        { localize(`ttb.aspects.${aspect}.name`) }
                                    </div>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

