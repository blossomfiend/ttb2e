<script>
    import NumberInput from "./NumberInput.svelte";
    import {localize} from "../util.js";
    import TextSuits from "./TextSuits.svelte";

    export let actor;
    $: system = actor.system;
    $: aspects = game.ttb2e.aspects.map(aspect => ({
        name: aspect,
        value: system.aspects[aspect],
    }));
    $: derivedAspects = game.ttb2e.derivedAspects.map(derivedAspect => ({
        name: derivedAspect,
        ...system.derivedAspects[derivedAspect],
    }));
</script>
<div class="flex flex-row gap-4">
    <div class="flex flex-col gap-3">
        {#each aspects as aspect}
            <label class="flex flex-row gap-1">
                <span class="flex-1">{localize(`ttb.aspects.${aspect.name}.name`)}</span>
                <span class="w-8">
                    <NumberInput name={`system.aspects.${aspect.name}`} value={aspect.value}/>
                </span>
            </label>
        {/each}
        <hr/>
        {#each derivedAspects as derivedAspect}
            <label class="flex flex-row items-center gap-1">
                <span class="flex-1">{localize(`ttb.derivedAspects.${derivedAspect.name}.name`)}</span>
                <span class="w-8">
                    <NumberInput name={`system.derivedAspects.${derivedAspect.name}.value.value`}
                                 value={derivedAspect.value.value} disabled/>
                </span>
                <TextSuits suits={derivedAspect.value.suits}/>
            </label>
        {/each}
    </div>
    <div>
        Fate steps here
    </div>
</div>
