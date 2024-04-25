<svelte:options accessors={true}/>
<script>
    import {localize} from "../util.js";

    export let formRoot;
    export let document;
    export let options;
    const rest = $$restProps;
</script>
<form bind:this={formRoot} class="flexcol" autocomplete="off">
    <div class="form-group">
        <label>Skill</label>
        <select name="skill">
            {#each game.ttb2e.skills as skill}
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
    <button type="submit">Flip</button>
</form>
