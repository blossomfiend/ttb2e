<svelte:options accessors={true}/>
<script>
    import InlineFateModifiers from "./partial/InlineFateModifiers.svelte";
    import Flip from "../flip.js";
    import SuitedNumberFormField from "./partial/SuitedNumberFormField.svelte";

    export let actor = null;
    export let skill = null;
    export let aspect = null;
    export let close = () => {
    };
    let inputAV = null;
    export {inputAV as actingValue};
    const rest = $$restProps;

    let targetNumber = null;
    let actingValue = inputAV ?? actor?.getActingValue(skill, aspect);

    const buttons = [3, 2, 1, 0, -1, -2, -3];

    $: startFlip = async (fateModifier) => {
        let flip = new Flip({fateModifier}, {
            actor,
            skill,
            aspect,
            targetNumber,
            actingValue,
        });
        await flip.evaluate();
        close();
    }
</script>

<form on:submit|preventDefault class="standard-form flex flex-col gap-5">
    <div class="form-group">
        <label>Acting Value</label>
        <div class="form-fields">
            <SuitedNumberFormField bind:value={actingValue} name="actingValue"/>
        </div>
        <p class="hint">
            Your acting value.
            You can press any of &lt;r, c, t, m&gt; in the entry field to quickly add suits,
            or &lt;R, C, T, M&gt; to remove suits.
        </p>
    </div>

    <div class="form-group">
        <label>Target Number</label>
        <div class="form-fields">
            <SuitedNumberFormField bind:value={targetNumber} name="targetNumber"/>
        </div>
        <p class="hint">
            The target number you are making a duel against. This can be left out.
            You can press any of &lt;r, c, t, m&gt; in the entry field to quickly add suits,
            or &lt;R, C, T, M&gt; to remove suits.
        </p>
    </div>

    <footer class="flex flex-row gap-1">
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
