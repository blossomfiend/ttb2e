<script>
    import NumberInput from "../partial/NumberInput.svelte";
    import {localize} from "../../util.js";
    import TextSuits from "../partial/TextSuits.svelte";
    import SkillConfigApplication from "../../applications/skill-config.js";
    import DuelApplication from "../../applications/duel.js";
    import TwistDeckInitApplication from "../../applications/twist-deck-init.js";

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
                <span class="w-12">
                    <NumberInput name={`system.aspects.${aspect.name}`} value={aspect.value}/>
                </span>
            </label>
        {/each}
        <hr/>
        {#each derivedAspects as derivedAspect}
            <div class="w-full flex flex-row items-center gap-1 justify-between">
                <div class="flex-1 hover:text-shadow-red hover:cursor-pointer"
                     on:click={() => new SkillConfigApplication({actor, skill: `derivedAspects.${derivedAspect.name}`}).render({force: true})}>
                    {localize(`ttb.derivedAspects.${derivedAspect.name}.name`)}
                </div>
                <button class="w-12 text-center hover:text-shadow-red hover:cursor-pointer"
                     on:click={() => new DuelApplication({actor, skill: `derivedAspects.${derivedAspect.name}`}).render({force: true})}>
                    {derivedAspect.value.value}
                    <TextSuits suits={derivedAspect.value.suits}/>
                </button>
            </div>
        {/each}
    </div>
    <div>
        Fate steps here
        <button on:click={() => {
            actor.ensureCardsExist();
            ui.notifications.info(localize("ttb.notifications.cardsCreated", {name: actor.name}));
        }}>
            Ensure Cards Documents exist
        </button>
        <button on:click={() => new TwistDeckInitApplication({document: actor}).render({force: true})}>
            Initialize Twist Deck
        </button>
    </div>
</div>
