<script>
    import SuitedNumberFormField from "./SuitedNumberFormField.svelte";

    export let actor;
    export let skill;
    $: skillObject = foundry.utils.getProperty(actor, `system.${skill}`);
</script>

<div class="form-group slim">
    <label>Override</label>
    <div class="form-fields">
        <input type="number" name={`system.${skill}.override`} value={skillObject.override}/>
    </div>
    <p class="hint">
        If provided, this value overrides the aspect and rank of the skill.
    </p>
</div>
<div class="form-group">
    <label>Bonus</label>
    <div class="form-fields">
        <SuitedNumberFormField name={`system.${skill}.bonus`} value={skillObject.bonus}/>
    </div>
    <p class="hint">
        A bonus, added to any check with this skill.
    </p>
</div>
<footer>
    <button>Save</button>
</footer>
