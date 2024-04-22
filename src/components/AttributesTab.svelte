<script>
    import NumberInput from "./NumberInput.svelte";
    import {localize} from "../util.js";
    export let actor;
    $: system = actor.system;
</script>
<div class="flex flex-row gap-4">
    <div class="flex flex-col gap-3">
        {#each game.ttb2e.aspects as aspect}
            <div class="flex flex-row gap-1">
                <label for={`system.aspects.${aspect}`}
                       class="flex-1">{localize(`ttb.aspects.${aspect}.name`)}</label>
                <div class="w-8">
                    <NumberInput name={`system.aspects.${aspect}`} value={system.aspects[aspect]}/>
                </div>
            </div>
        {/each}
        <hr/>
        {#each game.ttb2e.derivedAspects as derivedAspect}
            <div class="flex flex-row gap-1">
                <label for={`system.derivedAspects.${derivedAspect}.value.value`}
                       class="flex-1">{localize(`ttb.derivedAspects.${derivedAspect}.name`)}</label>
                <div class="w-8">
                    <NumberInput name={`system.derivedAspects.${derivedAspect}.value.value`}
                                 value={system.derivedAspects[derivedAspect].value.value} disabled/>
                </div>
            </div>
        {/each}
    </div>
    <div>
        Fate steps here
    </div>
</div>
