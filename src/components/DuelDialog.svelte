<svelte:options accessors={true}/>
<script>
    import {localize} from "../util.js";
    import InlineFateModifiers from "./InlineFateModifiers.svelte";
    import Flip from "../flip.js";
    import SuitedNumberFormField from "./SuitedNumberFormField.svelte";

    export let actor = null;
    export let skill = null;
    export let aspect = null;
    export let close = () => {};
    $: options = {skill, aspect};
    const rest = $$restProps;

    let targetNumber = null;

    const buttons = [3, 2, 1, 0, -1, -2, -3];

    $: startFlip = async (fateModifier) => {
        let flip = new Flip({fateModifier}, {
            skill,
            aspect,
            targetNumber,
            actingValue: actor.getActingValue(skill, aspect),
        });
        await flip.evaluate();
        close();
    }
</script>

<form on:submit|preventDefault={() => {}}>
    <!--<div class="form-group">-->
    <!--    <label>Skill</label>-->
    <!--    <select name="skill">-->
    <!--        {#each game.ttb2e.skills.toSorted((a, b) => a.name.localeCompare(b.name)) as skill}-->
    <!--            <option value={skill.name} selected={skill.name === options.skill}>-->
    <!--                {localize(`ttb.skills.${skill.name}.name`)}-->
    <!--            </option>-->
    <!--        {/each}-->
    <!--    </select>-->
    <!--</div>-->
    <!--<div class="form-group">-->
    <!--    <label>Aspect</label>-->
    <!--    <select name="aspect">-->
    <!--        {#each game.ttb2e.aspects as aspect}-->
    <!--            <option value={aspect} selected={aspect === options.aspect}>-->
    <!--                {localize(`ttb.aspects.${aspect}.name`)}-->
    <!--            </option>-->
    <!--        {/each}-->
    <!--    </select>-->
    <!--</div>-->
    <div class="form-group slim">
        <label>Target Number</label>
        <div class="form-fields">
            <SuitedNumberFormField bind:value={targetNumber}/>
        </div>
        <p class="hint">
            The target number you are making a duel against. This can be left out.
            You can press any of &lt;r, c, t, m&gt; in the entry field to quickly add suits,
            or &lt;R, C, T, M&gt; to remove suits.
        </p>
    </div>

    <footer class="mt-4 flex flex-row gap-1">
        {#each buttons as buttonFateModifier, buttonIdx}
            <button on:click={() => startFlip(buttonFateModifier)}>
            <span class="text-16">
                {#if buttonFateModifier === 0}
                    <span class="align-middle">Flip</span>
                {:else}
                    <InlineFateModifiers fateModifier={buttonFateModifier} class="align-middle"/>
                {/if}
            </span>
            </button>
        {/each}
    </footer>
</form>
