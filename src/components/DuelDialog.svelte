<svelte:options accessors={true}/>
<script>
    import {localize} from "../util.js";
    import InlineFateModifiers from "./InlineFateModifiers.svelte";

    export let actor = null;
    export let skill = null;
    export let aspect = null;
    $: options = {skill, aspect};
    const rest = $$restProps;

    const buttons = [3, 2, 1, 0, -1, -2, -3];
</script>

<div class="form-group">
    <label>Skill</label>
    <select name="skill">
        {#each game.ttb2e.skills.toSorted((a, b) => a.name.localeCompare(b.name)) as skill}
            <option value={skill.name} selected={skill.name === options.skill}>
                {localize(`ttb.skills.${skill.name}.name`)}
            </option>
        {/each}
    </select>
</div>
<div class="form-group">
    <label>Aspect</label>
    <select name="aspect">
        {#each game.ttb2e.aspects as aspect}
            <option value={aspect} selected={aspect === options.aspect}>
                {localize(`ttb.aspects.${aspect}.name`)}
            </option>
        {/each}
    </select>
</div>
<div class="form-group slim">
    <label>Target Number</label>
    <div class="form-fields">
        <input type="number" name="targetNumber" value=""/>
    </div>
    <p class="hint">The target number you are making a duel against. This can be left out.</p>
</div>

<footer class="flex flex-row gap-1">
    {#each buttons as buttonFateModifier, buttonIdx}
        <button type="submit" data-fate-modifier={buttonFateModifier}>
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

