<script>
    import NumberInput from "./NumberInput.svelte";
    import ActorFormPair from "./ActorFormPair.svelte";
    import {localize} from "../util.js";
    import {fly} from "svelte/transition";

    export let actor;
    let categories = game.ttb2e.skillCategories;
    $: skills = Object.values(actor.system.skills);
</script>


<div class="grid grid-cols-2 gap-4">
    {#each categories as category, categoryIdx (category)}
        <div class="flex flex-col gap-1">
            <h3 class="border-none text-16">{ localize(`ttb.skillCategories.${category}`) }</h3>

            <div class="flex flex-col divide-y w-full">
                {#each skills.filter(skill => skill.category === category) as skill, skillIdx (skill.name)}
                    <div
                        class="flex flex-row justify-between items-center border-border-dark-5 dark:border-border-light-2/50 w-full p-0 w-full"
                        in:fly|global={{ delay: skillIdx * 15 + categoryIdx * 40, duration: 250, y: 40 }}>
                        <div class="flex flex-row items-center gap-2 overflow-hidden">
                            <div class="flex flex-col items-center p-1">
                                <ActorFormPair actor={actor} name={`system.skills.${skill.name}.rank`} let:inputProps let:labelProps>
                                    <div class="w-8">
                                        <NumberInput {...inputProps} />
                                    </div>
                                    <label {...labelProps} class="text-13 leading-none small-caps text-text-dark-secondary dark:text-stone-300">Rank</label>
                                </ActorFormPair>
                                <!--
                                <div class="w-8">
                                    <NumberInput name={`system.skills.${skill.name}.rank`} value={skill.rank} />
                                </div>
                                <label for={`system.skills.${skill.name}.rank`}
                                       class="text-13 leading-none small-caps text-text-dark-secondary dark:text-stone-300">Rank</label>
                                       -->
                            </div>
                            <div class="p-1 hover:text-shadow-red truncate">
                                { localize(`ttb.skills.${skill.name}.name`) }
                            </div>
                        </div>
                        <div class="flex flex-row gap-2 h-full">
                            {#each skill.aspects as aspect (aspect)}
                                <div
                                    class="flex flex-col gap-0 items-center hover:text-shadow-red w-10 h-full justify-center">
                                    <div class="leading-none">{ skill.av[aspect].value }</div>
                                    <div class="italic text-11 leading-none text-text-dark-secondary dark:text-stone-300">
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

